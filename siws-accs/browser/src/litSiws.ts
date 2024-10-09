import { LitAbility, SolRpcConditions } from "@lit-protocol/types";
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
import litActionSiws from "./dist/litActionSiws.js?raw";

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
  ethersSigner: ethers.Wallet
) => {
  let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
  if (capacityTokenId === "" || capacityTokenId === undefined) {
    capacityTokenId = await mintLitCapacityCredit(ethersSigner);
  } else {
    console.log(
      `ℹ️  Using provided Capacity Credit with ID: ${capacityTokenId}`
    );
  }

  return litNodeClient.getSessionSigs({
    chain: "ethereum",
    expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    capabilityAuthSigs: [
      await getCapacityCreditDelegationAuthSig(
        litNodeClient,
        ethersSigner,
        capacityTokenId
      ),
    ],
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
      litNetwork: LIT_NETWORK,
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
