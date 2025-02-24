import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LIT_ABILITY, LIT_RPC, LIT_NETWORK } from "@lit-protocol/constants";
import ipfsOnlyHash from "typestub-ipfs-only-hash";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { AuthCallback } from "@lit-protocol/types";

import {
  LitActionResource,
  generateAuthSig,
  createSiweMessageWithRecaps,
} from "@lit-protocol/auth-helpers";

const ETHEREUM_PRIVATE_KEY = import.meta.env.VITE_ETHEREUM_PRIVATE_KEY;
const SELECTED_LIT_NETWORK = LIT_NETWORK.DatilDev;

let litNodeClient: LitNodeClient | null = null;
let litContractsClient: LitContracts | null = null;
let ethersSigner: ethers.Wallet | null = null;

export const getLitNodeClient = async () => {
  if (!litNodeClient) {
    console.log("🔄 Connecting to Lit Node Client...");
    litNodeClient = new LitNodeClient({
      litNetwork: SELECTED_LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit Node Client");
  }
  return litNodeClient;
};

export const getLitContractsClient = async (ethersSigner: ethers.Wallet) => {
  if (!litContractsClient) {
    console.log("🔄 Connecting to Lit Contracts Client...");
    litContractsClient = new LitContracts({
      signer: ethersSigner,
      network: SELECTED_LIT_NETWORK,
      debug: false,
    });
    await litContractsClient.connect();
    console.log("✅ Connected to Lit Contracts Client");
  }
  return litContractsClient;
};

export async function calculateLitActionCodeCID(
  input: string
): Promise<string> {
  try {
    const cid = await ipfsOnlyHash.of(input);
    return cid;
  } catch (error) {
    console.error("Error calculating CID for litActionCode:", error);
    throw error;
  }
}

export const getCurrentActionIpfsCidConditions = async (
  litActionCode: string
) => {
  return [
    {
      contractAddress: "",
      standardContractType: "",
      chain: "ethereum",
      method: "",
      parameters: [":currentActionIpfsId"],
      returnValueTest: {
        comparator: "=",
        value: await calculateLitActionCodeCID(litActionCode),
      },
    },
  ];
};

function getAuthNeededCallback(
  litNodeClient: LitNodeClient,
  ethersSigner: ethers.Wallet
): AuthCallback {
  return async ({ resourceAbilityRequests, expiration, uri }) => {
    const toSign = await createSiweMessageWithRecaps({
      uri: uri!,
      expiration: expiration!,
      resources: resourceAbilityRequests!,
      walletAddress: await ethersSigner.getAddress(),
      nonce: await litNodeClient.getLatestBlockhash(),
      litNodeClient,
    });

    const authSig = await generateAuthSig({
      signer: ethersSigner,
      toSign,
    });

    return authSig;
  };
}

export const getSessionSigs = async (litNodeClient: LitNodeClient) => {
  const ethersSigner = await getEthersSigner();
  console.log("Getting Session Signatures...");
  return litNodeClient.getSessionSigs({
    chain: "ethereum",
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    resourceAbilityRequests: [
      {
        resource: new LitActionResource("*"),
        ability: LIT_ABILITY.LitActionExecution,
      },
    ],
    authNeededCallback: getAuthNeededCallback(litNodeClient, ethersSigner),
  });
};

const getEthersSigner = async () => {
  if (!ethersSigner) {
    console.log("🔄 Creating ethers Signer...");
    ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );
    console.log("✅ Created ethers Signer");
  }
  return ethersSigner;
};
