import * as ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { EvmContractConditions } from "@lit-protocol/types";
import { decryptToFile } from "@lit-protocol/encryption";
import {
  LitAbility,
  LitAccessControlConditionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";

import { getEnv } from "../utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const decryptFileWithContractConditions = async (
  ciphertext: string,
  dataToEncryptHash: string,
  evmContractConditions: EvmContractConditions
) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(ETHEREUM_PRIVATE_KEY);

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Getting EOA Session Sigs...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      resourceAbilityRequests: [
        {
          //   resource: new LitAccessControlConditionResource(
          //     await LitAccessControlConditionResource.generateResourceString(
          //       evmContractConditions,
          //       dataToEncryptHash
          //     )
          //   ),
          resource: new LitAccessControlConditionResource("*"),
          ability: LitAbility.AccessControlConditionDecryption,
        },
      ],
      authNeededCallback: async ({
        resourceAbilityRequests,
        expiration,
        uri,
      }) => {
        const toSign = await createSiweMessageWithRecaps({
          uri: uri!,
          expiration: expiration!,
          resources: resourceAbilityRequests!,
          walletAddress: ethersSigner.address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });
    console.log("✅ Got EOA Session Sigs");

    console.log("🔄 Decrypting to file...");
    const decryptedFileBuffer = await decryptToFile(
      {
        ciphertext,
        dataToEncryptHash,
        chain: "sepolia",
        sessionSigs,
        evmContractConditions,
      },
      litNodeClient
    );
    console.log("✅ Decrypted file");

    return decryptedFileBuffer;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
