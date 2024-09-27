import {
  AuthMethodScope,
  AuthMethodType,
  LIT_RPC,
  LitNetwork,
} from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { SolRpcConditions } from "@lit-protocol/types";
import { ethers } from "ethers";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";

import {
  calculateLitActionCodeCID,
  getPkpInfoFromMintReceipt,
  mintCapacityCredit,
} from "./utils";
import { SiwsObject } from "./types";
import litActionCodeSessionSigs from "./dist/litActionSessionSigs.js?raw";
import litActionCodeSiws from "./dist/litActionSiws.js?raw";
import { getSolRpcConditions } from "./utils";

const ETHEREUM_PRIVATE_KEY = import.meta.env.VITE_ETHEREUM_PRIVATE_KEY;

let litNodeClient: LitNodeClient | null = null;
let litContractsClient: LitContracts | null = null;
let ethersSigner: ethers.Wallet | null = null;

const getLitNodeClient = async () => {
  if (!litNodeClient) {
    console.log("🔄 Connecting to Lit Node Client...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Datil,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit Node Client");
  }
  return litNodeClient;
};

const getLitContractsClient = async (ethersSigner: ethers.Wallet) => {
  if (!litContractsClient) {
    console.log("🔄 Connecting to Lit Contracts Client...");
    litContractsClient = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.Datil,
      debug: false,
    });
    await litContractsClient.connect();
    console.log("✅ Connected to Lit Contracts Client");
  }
  return litContractsClient;
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

export const encryptStringForAddress = async (
  stringToEncrypt: string,
  addressToEncryptFor: string
) => {
  try {
    const litNodeClient = await getLitNodeClient();
    console.log("🔄 Encrypting data...");
    const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
      dataToEncrypt: new TextEncoder().encode(stringToEncrypt),
      solRpcConditions: await getSolRpcConditions(
        addressToEncryptFor,
        litActionCodeSiws
      ),
    });
    console.log("✅ Encrypted data");
    return { ciphertext, dataToEncryptHash };
  } catch (error) {
    console.error("Error in encryptStringForAddress:", error);
    throw error;
  }
};

const mintPkpAndAddPermittedAuthMethods = async (solanaPublicKey: string) => {
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
      AuthMethodType.LitAction, // keyType
      [AuthMethodType.LitAction, authMethodType], // permittedAuthMethodTypes
      [
        `0x${Buffer.from(
          ethers.utils.base58.decode(
            await calculateLitActionCodeCID(litActionCodeSessionSigs)
          )
        ).toString("hex")}`,
        authMethodId,
      ], // permittedAuthMethodIds
      ["0x", "0x"], // permittedAuthMethodPubkeys
      [[AuthMethodScope.SignAnything], [AuthMethodScope.NoPermissions]], // permittedAuthMethodScopes
      false, // addPkpEthAddressAsPermittedAddress
      true, // sendPkpToItself
      { value: await litContractsClient.pkpNftContract.read.mintCost() }
    );
  const receipt = await tx.wait();
  console.log("✅ Minted PKP");

  return getPkpInfoFromMintReceipt(receipt, litContractsClient);
};

const getSessionSigs = async (
  pkpInfo: {
    ethAddress: string;
    publicKey: string;
    tokenId: string;
  },
  siwsObject: SiwsObject
) => {
  const litNodeClient = await getLitNodeClient();
  const ethersSigner = await getEthersSigner();

  console.log("🔄 Minting capacity credit...");
  const capacityTokenId = await mintCapacityCredit(ethersSigner);
  console.log("✅ Minted capacity credit");

  console.log("🔄 Creating capacity delegation auth sig...");
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: ethersSigner,
      capacityTokenId,
      delegateeAddresses: [pkpInfo.ethAddress],
      uses: "1",
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
        ability: LitAbility.PKPSigning,
      },
      {
        resource: new LitActionResource("*"),
        ability: LitAbility.LitActionExecution,
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

export async function decryptData(
  siwsObject: SiwsObject,
  solRpcConditions: SolRpcConditions,
  ciphertext: string,
  dataToEncryptHash: string
) {
  const pkpInfo = await mintPkpAndAddPermittedAuthMethods(
    siwsObject.siwsInput.address
  );

  try {
    console.log("🔄 Decrypting data...");
    const litNodeClient = await getLitNodeClient();
    const response = await litNodeClient.executeJs({
      code: litActionCodeSiws,
      sessionSigs: await getSessionSigs(pkpInfo, siwsObject),
      jsParams: {
        siwsObject: JSON.stringify(siwsObject),
        solRpcConditions,
        ciphertext,
        dataToEncryptHash,
      },
    });
    console.log("✅ Decrypted data");

    litNodeClient.disconnect();

    return response.response;
  } catch (error) {
    console.error("Error in decryptData:", error);
    throw error;
  }
}
