import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  AUTH_METHOD_SCOPE,
  LIT_ABILITY,
  AUTH_METHOD_TYPE,
  LIT_RPC,
  LIT_NETWORK,
} from "@lit-protocol/constants";
import ipfsOnlyHash from "typestub-ipfs-only-hash";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { type SessionSigs } from "@lit-protocol/types";

import litActionCodeSessionSigs from "./litActions/dist/litActionSessionSigs.js?raw";
import { SiwsObject } from "./types";
import {
  LitAccessControlConditionResource,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";

const ETHEREUM_PRIVATE_KEY = import.meta.env.VITE_ETHEREUM_PRIVATE_KEY;
const SELECTED_LIT_NETWORK = LIT_NETWORK.Datil;

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

export const mintPkpAndAddPermittedAuthMethods = async (
  solanaPublicKey: string
) => {
  const ethersSigner = await getEthersSigner();
  const litContractsClient = await getLitContractsClient(ethersSigner);

  const authMethodType = ethers.utils.keccak256(
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
            await calculateLitActionCodeCID(litActionCodeSessionSigs)
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

export const getSessionSigs = async (
  pkpInfo: {
    ethAddress: string;
    publicKey: string;
    tokenId: string;
  },
  siwsObject: SiwsObject
): Promise<SessionSigs> => {
  const litNodeClient = await getLitNodeClient();
  const ethersSigner = await getEthersSigner();

  const capacityTokenId = await mintCapacityCredit(ethersSigner);

  console.log(
    `🔄 Creating capacity delegation auth sig for ${pkpInfo.ethAddress}...`
  );
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: ethersSigner,
      capacityTokenId,
      delegateeAddresses: [pkpInfo.ethAddress],
      uses: "10",
    });
  console.log("✅ Created capacity delegation auth sig");

  console.log("🔄 Getting session sigs...");
  const sessionSigs = await litNodeClient.getLitActionSessionSigs({
    pkpPublicKey: pkpInfo.publicKey,
    litActionCode: Buffer.from(litActionCodeSessionSigs).toString("base64"),
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
      pkpTokenId: pkpInfo.tokenId,
    },
  });
  console.log("✅ Got session sigs");
  return sessionSigs;
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

const mintCapacityCredit = async (ethersSigner: ethers.Wallet) => {
  try {
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: SELECTED_LIT_NETWORK,
    });
    await litContracts.connect();

    console.log(`🔄 Minting capacity credit for ${ethersSigner.address}...`);
    const capacityTokenId = (
      await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 1,
      })
    ).capacityTokenIdStr;
    console.log(`✅ Minted capacity credit with id: ${capacityTokenId}`);
    return capacityTokenId;
  } catch (error) {
    console.error("Error minting capacity credit:", error);
    throw error;
  }
};
