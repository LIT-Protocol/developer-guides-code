import { type LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  createSiweMessage,
  generateAuthSig,
  LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";
import { LIT_ABILITY } from "@lit-protocol/constants";
import { AccessControlConditions } from "@lit-protocol/types";
import { promises as fs } from "fs";
import { join } from "path";

import { getEnv, getEthersSigner, getLitNodeClient } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const encryptFile = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const filePath = join(process.cwd(), "src", "loremIpsum.txt");
    const fileContent = await fs.readFile(filePath, "utf8");

    const ethersSigner = getEthersSigner(ETHEREUM_PRIVATE_KEY);
    litNodeClient = await getLitNodeClient();

    const accessControlConditions: AccessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: await ethersSigner.getAddress(),
        },
      },
    ];

    const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
      dataToEncrypt: new TextEncoder().encode(fileContent),
      accessControlConditions,
    });

    console.log(`ℹ️  dataToEncryptHash: ${dataToEncryptHash}`);

    const sessionSignatures = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: LIT_ABILITY.AccessControlConditionDecryption,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }) => {
        const toSign = await createSiweMessage({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: await ethersSigner.getAddress(),
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });

    const decryptionResponse = await litNodeClient.decrypt({
      chain: "ethereum",
      sessionSigs: sessionSignatures,
      ciphertext,
      dataToEncryptHash,
      accessControlConditions,
    });

    const decryptedString = new TextDecoder().decode(
      decryptionResponse.decryptedData
    );

    const outputPath = join(process.cwd(), "src", "loremIpsum-decrypted.txt");
    await fs.writeFile(outputPath, decryptedString, "utf8");

    console.log(`ℹ️  Decrypted content saved to: ${outputPath}`);
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
