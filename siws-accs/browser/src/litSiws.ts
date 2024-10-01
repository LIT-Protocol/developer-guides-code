import { LitAbility, SolRpcConditions } from "@lit-protocol/types";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { ethers } from "ethers";
import {
  createSiweMessage,
  generateAuthSig,
  LitActionResource,
} from "@lit-protocol/auth-helpers";

import { SiwsObject } from "./types";
import litActionSiws from "./dist/litActionSiws.js?raw";

const ETHEREUM_PRIVATE_KEY = import.meta.env.VITE_ETHEREUM_PRIVATE_KEY;

const getSessionSigs = async (
  litNodeClient: LitNodeClient,
  ethersSigner: ethers.Wallet
) => {
  return litNodeClient.getSessionSigs({
    chain: "ethereum",
    expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    resourceAbilityRequests: [
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
  });
};

export const getSolRpcConditions = async (address: string) => {
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
  ];
};

export const litSiws = async (
  siwsObject: SiwsObject,
  solRpcConditions: SolRpcConditions
) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting to Lit Node Client...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit Node Client");

console.log("🔄 Attempting SIWS authentication...");
    const response = await litNodeClient.executeJs({
      code: litActionSiws,
      sessionSigs: await getSessionSigs(litNodeClient, ethersSigner),
      jsParams: {
        siwsObject: JSON.stringify(siwsObject),
        solRpcConditions,
      },
    });

console.log("✅ Successfully authenticated with SIWS message");
    return Boolean(response.response);
  } catch (error) {
    console.error("Error in litSiws:", error);
    throw error;
  } finally {
    litNodeClient!.disconnect();
  }
};
