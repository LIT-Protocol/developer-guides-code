import { LitAbility, SessionSigs } from "@lit-protocol/types";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { ethers } from "ethers";
import {
  createSiweMessage,
  generateAuthSig,
  LitActionResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";

import { SiwsObject } from "./types";
import litActionSiwsAuth from "./dist/litActionSiwsAuth.js?raw";

const ETHEREUM_PRIVATE_KEY = import.meta.env.VITE_ETHEREUM_PRIVATE_KEY;
const LIT_CAPACITY_CREDIT_TOKEN_ID =
  import.meta.env.VITE_LIT_CAPACITY_CREDIT_TOKEN_ID || undefined;
const LIT_NETWORK = import.meta.env.VITE_LIT_NETWORK || LitNetwork.DatilTest;

const mintLitCapacityCredit = async (ethersSigner: ethers.Wallet) => {
  console.log("🔄  Connecting LitContracts client to network...");
  const litContracts = new LitContracts({
    signer: ethersSigner,
    network: LIT_NETWORK,
    debug: false,
  });
  await litContracts.connect();
  console.log("✅ Connected LitContracts client to network");

  console.log("🔄 No Capacity Credit provided, minting a new one...");
  const capacityTokenId = (
    await litContracts.mintCapacityCreditsNFT({
      requestsPerKilosecond: 10,
      daysUntilUTCMidnightExpiration: 1,
    })
  ).capacityTokenIdStr;
  console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);

  return capacityTokenId;
};

const getCapacityCreditDelegationAuthSig = async (
  litNodeClient: LitNodeClient,
  ethersSigner: ethers.Wallet,
  capacityTokenId: string
) => {
  console.log("🔄 Creating capacityDelegationAuthSig...");
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: ethersSigner,
      capacityTokenId,
    });
  console.log("✅ Capacity Delegation Auth Sig created");

  return capacityDelegationAuthSig;
};

const getSessionSigs = async (
  litNodeClient: LitNodeClient,
  ethersSigner: ethers.Wallet,
  siwsObject: SiwsObject
): Promise<SessionSigs> => {
  let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
  if (capacityTokenId === "" || capacityTokenId === undefined) {
    capacityTokenId = await mintLitCapacityCredit(ethersSigner);
  } else {
    console.log(
      `ℹ️  Using provided Capacity Credit with ID: ${capacityTokenId}`
    );
  }

  const capacityDelegationAuthSig = await getCapacityCreditDelegationAuthSig(
    litNodeClient,
    ethersSigner,
    capacityTokenId
  );

  console.log("🔄 Getting session sigs...");
  const sessionSigs = await litNodeClient.getSessionSigs({
    chain: "ethereum",
    expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    capabilityAuthSigs: [capacityDelegationAuthSig],
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
  console.log("✅ Got session sigs");
  return sessionSigs;
};

export const authenticateSiwsMessage = async (
  siwsObject: SiwsObject
): Promise<string> => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting to Lit Node Client...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit Node Client");

    console.log("🔄 Creating ethers Signer...");
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );
    console.log("✅ Created ethers Signer");

    console.log("🔄 Authenticating SIWS message...");
    const response = await litNodeClient.executeJs({
      code: litActionSiwsAuth,
      sessionSigs: await getSessionSigs(
        litNodeClient,
        ethersSigner,
        siwsObject
      ),
      jsParams: {
        siwsObject: JSON.stringify(siwsObject),
      },
    });
    console.log("✅ Authenticated SIWS message");

    return response.response as string;
  } finally {
    litNodeClient!.disconnect();
  }
};
