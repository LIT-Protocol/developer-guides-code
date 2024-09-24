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
import { SiwsObject } from "./App";
import litActionCode from "./dist/litActionSiws.js?raw";

const ETHEREUM_PRIVATE_KEY = import.meta.env.VITE_ETHEREUM_PRIVATE_KEY;

export const encryptStringForAddress = async (
  stringToEncrypt: string,
  addressToEncryptFor: string
) => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
      dataToEncrypt: new TextEncoder().encode(stringToEncrypt),
      solRpcConditions: [
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
            value: addressToEncryptFor,
          },
        },
      ],
    });

    return { ciphertext, dataToEncryptHash };
  } catch (error) {
    console.error("Error in encryptStringForAddress:", error);
    throw error;
  } finally {
    litNodeClient!.disconnect();
  }
};

async function decryptData(
  siwsObject: SiwsObject,
  solRpcConditions: SolRpcConditions,
  ciphertext: string,
  dataToEncryptHash: string
) {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("jsParams", {
      siwsObject: JSON.stringify(siwsObject),
      solRpcConditions,
      ciphertext,
      dataToEncryptHash,
    });

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

    console.log("response", response);

    return response.response;
  } catch (error) {
    console.error("Error in decryptData:", error);
    throw error;
  } finally {
    litNodeClient!.disconnect();
  }
}

export { decryptData };
