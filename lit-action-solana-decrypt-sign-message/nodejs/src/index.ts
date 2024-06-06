import {
  LitAbility,
  LitAccessControlConditionResource,
  LitActionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { LitNetwork } from "@lit-protocol/constants";
import { LitNodeClient, encryptString } from "@lit-protocol/lit-node-client";
import * as ethers from "ethers";
import { AccessControlConditions } from "@lit-protocol/types";
import { readFileSync } from "fs";

const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const ETHERS_WALLET = new ethers.Wallet(ETHEREUM_PRIVATE_KEY);
const SOLANA_PRIVATE_KEY = getEnv("SOLANA_PRIVATE_KEY");
const LIT_ACTION_CODE = readFileSync("./dist/bundle.js", "utf-8");

export const decryptKeyAndSignMessage = async (messageToSign: string) => {
  let litNodeClient: LitNodeClient;

  try {
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Cayenne,
      debug: true,
    });
    await litNodeClient.connect();

    const decryptionAccessControlConditions: AccessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress", "latest"],
        returnValueTest: {
          comparator: "=",
          value: await ETHERS_WALLET.getAddress(),
        },
      },
    ];
    console.log("Encrypting Solana private key...");
    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        accessControlConditions: decryptionAccessControlConditions,
        dataToEncrypt: SOLANA_PRIVATE_KEY,
      },
      litNodeClient
    );

    console.log("Getting Lit session signatures...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: LitAbility.AccessControlConditionDecryption,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }) => {
        const toSign = await createSiweMessageWithRecaps({
          uri: uri!,
          expiration: expiration!,
          resources: resourceAbilityRequests!,
          walletAddress: await ETHERS_WALLET.getAddress(),
          nonce: await litNodeClient!.getLatestBlockhash(),
          litNodeClient,
        });
        return await generateAuthSig({
          signer: ETHERS_WALLET,
          toSign,
        });
      },
    });

    console.log(
      "Decrypting Solana private key and signing message via Lit Action..."
    );
    const litActionResult = await litNodeClient.executeJs({
      sessionSigs,
      code: LIT_ACTION_CODE,
      jsParams: {
        accessControlConditions: decryptionAccessControlConditions,
        ciphertext,
        dataToEncryptHash,
        sessionSigs,
        message: messageToSign,
      },
    });
    return litActionResult.response as string;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
