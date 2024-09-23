import { encryptString, LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { EvmContractConditions } from "@lit-protocol/types";
import { ethers } from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  createSiweMessage,
  generateAuthSig,
  LitAbility,
  LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const DEPLOYED_ACCESS_CONTROL_CONTRACT_ADDRESS = getEnv(
  "DEPLOYED_ACCESS_CONTROL_CONTRACT_ADDRESS"
);
const LIT_CAPACITY_CREDIT_TOKEN_ID = process.env.LIT_CAPACITY_CREDIT_TOKEN_ID;
const LIT_NETWORK = LitNetwork.DatilTest;

export const runExample = async (dataToEncrypt: string) => {
  let litNodeClient: LitNodeClient;

  try {
    const evmContractConditions: EvmContractConditions = [
      {
        contractAddress: DEPLOYED_ACCESS_CONTROL_CONTRACT_ADDRESS,
        functionName: "hasRevokedAccess",
        functionParams: [":userAddress"],
        functionAbi: {
          type: "function",
          name: "hasRevokedAccess",
          inputs: [{ name: "user", type: "address", internalType: "address" }],
          outputs: [{ name: "", type: "bool", internalType: "bool" }],
          stateMutability: "view",
        },
        chain: "yellowstone",
        returnValueTest: {
          key: "",
          comparator: "=",
          value: "false",
        },
      },
    ];

    const ethersWallet = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log(`🔄 Connecting to Lit ${LIT_NETWORK} network...`);
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();
    console.log(`✅ Connected to Lit ${LIT_NETWORK} network`);

    console.log(`🔄 Connecting LitContracts client to ${LIT_NETWORK} network...`);
    const litContracts = new LitContracts({
      signer: ethersWallet,
      network: LIT_NETWORK,
      debug: false,
    });
    await litContracts.connect();
    console.log(`✅ Connected LitContracts client to ${LIT_NETWORK} network`);

    console.log("🔄 Encrypting the string...");
    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        evmContractConditions,
        dataToEncrypt: dataToEncrypt,
      },
      litNodeClient
    );
    console.log("✅ Encrypted the string");

    let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (capacityTokenId === "" || capacityTokenId === undefined) {
      console.log("🔄 No Capacity Credit provided, minting a new one...");
      capacityTokenId = (
        await litContracts.mintCapacityCreditsNFT({
          requestsPerKilosecond: 10000,
          daysUntilUTCMidnightExpiration: 7,
        })
      ).capacityTokenIdStr;
      console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    } else {
      console.log(
        `ℹ️  Using provided Capacity Credit with ID: ${LIT_CAPACITY_CREDIT_TOKEN_ID}`
      );
    }

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersWallet,
        capacityTokenId,
        delegateeAddresses: [ethersWallet.address],
        uses: "1",
      });
    console.log("✅ Capacity Delegation Auth Sig created");

    console.log("🔄 Generating the Lit Resource string...");
    const litResourceString =
      await LitAccessControlConditionResource.generateResourceString(
        evmContractConditions as any,
        dataToEncryptHash
      );
    console.log("✅ Generated the Lit Resource string");

    console.log("🔄 Getting the Session Signatures...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      capabilityAuthSigs: [capacityDelegationAuthSig],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource(litResourceString),
          ability: LitAbility.AccessControlConditionDecryption,
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
          walletAddress: ethersWallet.address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersWallet,
          toSign,
        });
      },
    });
    console.log("✅ Generated the Session Signatures");

    console.log("🔄 Decrypting the string...");
    const decryptedStringUint8Array = await litNodeClient.decrypt({
      ciphertext,
      dataToEncryptHash,
      evmContractConditions,
      chain: "yellowstone",
      sessionSigs,
    });

    const decryptedString = new TextDecoder().decode(
      decryptedStringUint8Array.decryptedData
    );
    console.log("✅ Decrypted the string");

    return decryptedString;
  } catch (error) {
    throw error;
  } finally {
    litNodeClient!.disconnect();
  }
};
