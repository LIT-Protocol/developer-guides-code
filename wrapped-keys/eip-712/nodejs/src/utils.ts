import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from "ethers";
import {
  AuthSig,
  LitResourceAbilityRequest,
} from "@lit-protocol/auth-helpers";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { api } from "@lit-protocol/wrapped-keys";
import { AccsDefaultParams, LIT_NETWORKS_KEYS, SessionSigsMap } from "@lit-protocol/types";

const { generatePrivateKey } = api;

export const getEnv = (name: string): string => {
  // Browser environment
  if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
    const envMap: Record<string, string | undefined> = {
      'ETHEREUM_PRIVATE_KEY': process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY,
      'SOLANA_PRIVATE_KEY': process.env.NEXT_PUBLIC_SOLANA_PRIVATE_KEY,
    };
    const env = envMap[name];
    if (env === undefined || env === "")
      throw new Error(
        `${name} ENV is not defined, please define it in the .env file`
      );
    return env;
  }
  
  // Node environment
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

export const getLitNodeClient = async (litNetwork: LIT_NETWORKS_KEYS) => {
  console.log("🔄 Connecting LitNodeClient to Lit network...");
  const litNodeClient = new LitNodeClient({
    litNetwork,
    debug: false,
  });
  await litNodeClient.connect();
  console.log("✅ Connected LitNodeClient to Lit network");

  return litNodeClient;
};

export const getLitContracts = async (
  ethersSigner: ethers.Wallet,
  litNetwork: LIT_NETWORKS_KEYS
) => {
  console.log("🔄 Connecting LitContracts client to network...");
  const litContracts = new LitContracts({
    signer: ethersSigner,
    network: litNetwork,
    debug: false,
  });
  await litContracts.connect();
  console.log("✅ Connected LitContracts client to network");

  return litContracts;
};

export const mintPkp = async (litContracts: LitContracts) => {
  console.log("🔄 Minting new PKP...");
  const pkpInfo = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
  console.log(
    `✅ Minted new PKP with public key: ${pkpInfo.publicKey} and ETH address: ${pkpInfo.ethAddress}`
  );
  return pkpInfo;
};

export const getCapacityCreditTokenId = async (
  litContracts: LitContracts,
  requestsPerKilosecond: number = 10,
  daysUntilUTCMidnightExpiration: number = 1
) => {
  console.log("🔄 Minting Capacity Credits NFT...");
  const capacityTokenId = (
    await litContracts.mintCapacityCreditsNFT({
      requestsPerKilosecond,
      daysUntilUTCMidnightExpiration,
    })
  ).capacityTokenIdStr;
  console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);

  return capacityTokenId;
};

export const getCapacityCreditDelegationAuthSig = async (
  litNodeClient: LitNodeClient,
  ethersSigner: ethers.Wallet,
  pkpEthAddress: string,
  capacityTokenId: string,
  uses: string = "1"
) => {
  console.log("🔄 Creating capacityDelegationAuthSig...");
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: ethersSigner,
      capacityTokenId,
      delegateeAddresses: [pkpEthAddress],
      uses,
    });
  console.log(`✅ Created the capacityDelegationAuthSig`);

  return capacityDelegationAuthSig;
};

export const getSessionSigsViaPkp = async (
  litNodeClient: LitNodeClient,
  pkpPublicKey: string,
  ethersSigner: ethers.Wallet,
  capabilityAuthSigs: AuthSig[],
  resourceAbilityRequests: LitResourceAbilityRequest[]
) => {
  console.log("🔄 Getting PKP Session Sigs...");
  const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
    pkpPublicKey,
    capabilityAuthSigs,
    authMethods: [
      await EthWalletProvider.authenticate({
        // @ts-ignore
        signer: ethersSigner,
        litNodeClient,
        expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      }),
    ],
    resourceAbilityRequests,
    expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
  });
  console.log("✅ Got PKP Session Sigs");

  return pkpSessionSigs;
};

export const generateWrappedKey = async (
  pkpSessionSigs: SessionSigsMap,
  litNodeClient: LitNodeClient,
  evmOrSolana: "evm" | "solana" = "evm",
  wrappedKeyMemo: string = "This is a test memo"
) => {
  console.log("🔄 Generating wrapped key...");
  const wrappedKeyInfo = await generatePrivateKey({
    pkpSessionSigs,
    network: evmOrSolana,
    memo: wrappedKeyMemo,
    litNodeClient,
  });
  console.log(
    `✅ Generated wrapped key with id: ${wrappedKeyInfo.id} and public key: ${wrappedKeyInfo.generatedPublicKey}`
  );

  return wrappedKeyInfo;
};

export function getPkpAccessControlCondition(
  pkpAddress: string
): AccsDefaultParams {
  if (!ethers.utils.isAddress(pkpAddress)) {
    throw new Error(
      `pkpAddress is not a valid Ethereum Address: ${pkpAddress}`
    );
  }

  return {
    contractAddress: "",
    standardContractType: "",
    chain: "ethereum",
    method: "",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: "=",
      value: pkpAddress,
    },
  };
}
