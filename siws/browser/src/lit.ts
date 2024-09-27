import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { SolRpcConditions } from "@lit-protocol/types";
import { ethers } from "ethers";
import {
  createSiweMessage,
  generateAuthSig,
  LitAbility,
  LitAccessControlConditionResource,
  LitActionResource,
} from "@lit-protocol/auth-helpers";

import { calculateLitActionCodeCID } from "./utils";
import { SiwsObject } from "./types";
import litActionCode from "./dist/litActionSiws.js?raw";

const ETHEREUM_PRIVATE_KEY = import.meta.env.VITE_ETHEREUM_PRIVATE_KEY;

let litNodeClient: LitNodeClient | null = null;

const getLitNodeClient = async () => {
  if (!litNodeClient) {
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
  }
  return litNodeClient;
};

export const getSolRpcConditions = async (
  address: string,
  litActionCode: string
) => {
  return [
    {
      method: "",
      params: [":userAddress"],
      pdaParams: [],
      pdaInterface: { offset: 0, fields: {} },
      pdaKey: "",
      chain: "solana",
      returnValueTest: {
        key: "",
        comparator: "=",
        value: address,
      },
    },
    { operator: "and" },
    {
      method: "",
      params: [":currentActionIpfsId"],
      pdaParams: [],
      pdaInterface: { offset: 0, fields: {} },
      pdaKey: "",
      chain: "solana",
      returnValueTest: {
        key: "",
        comparator: "=",
        value: await calculateLitActionCodeCID(litActionCode),
      },
    },
  ];
};

export const encryptStringForAddress = async (
  stringToEncrypt: string,
  addressToEncryptFor: string
) => {
  try {
    const litNodeClient = await getLitNodeClient();
    const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
      dataToEncrypt: new TextEncoder().encode(stringToEncrypt),
      solRpcConditions: await getSolRpcConditions(
        addressToEncryptFor,
        litActionCode
      ),
    });

    return { ciphertext, dataToEncryptHash };
  } catch (error) {
    console.error("Error in encryptStringForAddress:", error);
    throw error;
  }
};

export async function decryptData(
  siwsObject: SiwsObject,
  solRpcConditions: SolRpcConditions,
  ciphertext: string,
  dataToEncryptHash: string
) {
  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    const litNodeClient = await getLitNodeClient();
    const response = await litNodeClient.executeJs({
      code: litActionCode,
      sessionSigs: await litNodeClient.getSessionSigs({
        chain: "ethereum",
        expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        resourceAbilityRequests: [
          {
            resource: new LitAccessControlConditionResource("*"),
            ability: LitAbility.AccessControlConditionDecryption,
          },
          {
            resource: new LitActionResource("*"),
            ability: LitAbility.LitActionExecution,
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
      }),
      jsParams: {
        siwsObject: JSON.stringify(siwsObject),
        solRpcConditions,
        ciphertext,
        dataToEncryptHash,
      },
    });

    return response.response;
  } catch (error) {
    console.error("Error in decryptData:", error);
    throw error;
  }
}
