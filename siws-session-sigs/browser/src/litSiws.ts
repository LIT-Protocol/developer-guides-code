import { SessionSigs } from "@lit-protocol/types";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  AUTH_METHOD_SCOPE,
  AUTH_METHOD_TYPE,
  LIT_RPC,
  LIT_NETWORK,
  LIT_ABILITY
} from "@lit-protocol/constants";
import { ethers } from "ethers";
import {
  LitAccessControlConditionResource,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import ipfsOnlyHash from "typestub-ipfs-only-hash";

import { SiwsObject } from "./types";
import litActionSessionSigs from "./dist/litActionSessionSigs.js?raw";

const ETHEREUM_PRIVATE_KEY = import.meta.env.VITE_ETHEREUM_PRIVATE_KEY;
const LIT_CAPACITY_CREDIT_TOKEN_ID =
  import.meta.env.VITE_LIT_CAPACITY_CREDIT_TOKEN_ID || undefined;
const SELECTED_LIT_NETWORK = import.meta.env.VITE_LIT_NETWORK || LIT_NETWORK.DatilTest;
const LIT_PKP_PUBLIC_KEY = import.meta.env.VITE_LIT_PKP_PUBLIC_KEY || undefined;
const LIT_PKP_TOKEN_ID = import.meta.env.VITE_LIT_PKP_TOKEN_ID || undefined;

const mintLitCapacityCredit = async (ethersSigner: ethers.Wallet) => {
  console.log("🔄  Connecting LitContracts client to network...");
  const litContracts = new LitContracts({
    signer: ethersSigner,
    network: SELECTED_LIT_NETWORK,
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

async function calculateLitActionCodeCID(input: string): Promise<string> {
  try {
    const cid = await ipfsOnlyHash.of(input);
    return cid;
  } catch (error) {
    console.error("Error calculating CID for litActionCode:", error);
    throw error;
  }
}

const getPkpInfoFromMintReceipt = async (
  txReceipt: ethers.ContractReceipt,
  litContractsClient: LitContracts
) => {
  const pkpMintedEvent = txReceipt!.events!.find(
    (event) =>
      event.topics[0] ===
      "0x3b2cc0657d0387a736293d66389f78e4c8025e413c7a1ee67b7707d4418c46b8"
  );

  const publicKey = "0x" + pkpMintedEvent!.data.slice(130, 260);
  const tokenId = ethers.utils.keccak256(publicKey);
  const ethAddress = await litContractsClient.pkpNftContract.read.getEthAddress(
    tokenId
  );

  return {
    tokenId: ethers.BigNumber.from(tokenId).toString(),
    publicKey,
    ethAddress,
  };
};

const mintPkpAndAddPermittedAuthMethods = async (
  ethersSigner: ethers.Wallet,
  solanaPublicKey: string
) => {
  console.log("🔄 Connecting to Lit Contracts Client...");
  const litContractsClient = new LitContracts({
    signer: ethersSigner,
    network: SELECTED_LIT_NETWORK,
    debug: false,
  });
  await litContractsClient.connect();
  console.log("✅ Connected to Lit Contracts Client");

  const authMethodType = ethers.utils.keccak256(
    // This can be anything, but should be unique to your app
    ethers.utils.toUtf8Bytes("Lit Developer Guide Solana SIWS Example")
  );
  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(`siws:${solanaPublicKey}`)
  );

  console.log("🔄 Minting PKP...");
  const tx =
    await litContractsClient.pkpHelperContract.write.mintNextAndAddAuthMethods(
      AUTH_METHOD_TYPE.LitAction, // keyType
      [AUTH_METHOD_TYPE.LitAction, authMethodType], // permittedAuthMethodTypes
      [
        `0x${Buffer.from(
          ethers.utils.base58.decode(
            await calculateLitActionCodeCID(litActionSessionSigs)
          )
        ).toString("hex")}`,
        authMethodId,
      ], // permittedAuthMethodIds
      ["0x", "0x"], // permittedAuthMethodPubkeys
      [[AUTH_METHOD_SCOPE.SignAnything], [AUTH_METHOD_SCOPE.NoPermissions]], // permittedAuthMethodScopes
      true, // addPkpEthAddressAsPermittedAddress
      true, // sendPkpToItself
      { value: await litContractsClient.pkpNftContract.read.mintCost() }
    );
  const receipt = await tx.wait();
  console.log("✅ Minted PKP");

  const pkpInfo = await getPkpInfoFromMintReceipt(receipt, litContractsClient);
  console.log(`ℹ️ Minted PKP with token id: ${pkpInfo.tokenId}`);
  console.log(`ℹ️ Minted PKP with public key: ${pkpInfo.publicKey}`);
  console.log(`ℹ️ Minted PKP with ETH address: ${pkpInfo.ethAddress}`);
  return pkpInfo;
};

export const getSiwsSessionSigs = async (
  siwsObject: SiwsObject
): Promise<SessionSigs> => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting to Lit Node Client...");
    litNodeClient = new LitNodeClient({
      litNetwork: SELECTED_LIT_NETWORK,
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

    let pkpPublicKey = LIT_PKP_PUBLIC_KEY;
    let pkpTokenId = LIT_PKP_TOKEN_ID;
    if (pkpPublicKey === undefined || pkpTokenId === undefined) {
      const pkpInfo = await mintPkpAndAddPermittedAuthMethods(
        ethersSigner,
        siwsObject.siwsInput.address
      );
      pkpPublicKey = pkpInfo.publicKey;
      pkpTokenId = pkpInfo.tokenId;
    } else {
      console.log(
        `ℹ️  Using provided PKP with public key: ${pkpPublicKey} and token id: ${pkpTokenId}`
      );
    }

    console.log("🔄 Getting session sigs...");
    const sessionSigs = await litNodeClient.getLitActionSessionSigs({
      pkpPublicKey: pkpPublicKey,
      litActionCode: Buffer.from(litActionSessionSigs).toString("base64"),
      capabilityAuthSigs: [capacityDelegationAuthSig],
      chain: "ethereum",
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LIT_ABILITY.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LIT_ABILITY.LitActionExecution,
        },
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: LIT_ABILITY.AccessControlConditionDecryption,
        },
      ],
      jsParams: {
        siwsObject: JSON.stringify(siwsObject),
        pkpTokenId: pkpTokenId,
      },
    });
    console.log("✅ Got session sigs");

    return sessionSigs;
  } finally {
    litNodeClient!.disconnect();
  }
};
