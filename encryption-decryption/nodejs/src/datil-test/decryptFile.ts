import * as ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, LIT_RPC } from "@lit-protocol/constants";
import { AuthCallbackParams, EvmContractConditions } from "@lit-protocol/types";
import { decryptToFile } from "@lit-protocol/encryption";
import {
  LitAbility,
  LitAccessControlConditionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
  newSessionCapabilityObject,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";

import { getEnv } from "../utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const decryptFileWithContractConditions = async (
  ciphertext: string,
  dataToEncryptHash: string,
  evmContractConditions: EvmContractConditions
) => {
  let litNodeClient: LitNodeClient;
  let litContractsClient: LitContracts;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilTest,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Connecting to Lit Contracts...");
    litContractsClient = new LitContracts({
      network: "datil-test",
      signer: ethersSigner,
    });
    await litContractsClient.connect();
    console.log("✅ Connected to Lit Contracts...");

    console.log("🔄 Attempting to mint capacitycreditsNFT...");
    const { capacityTokenIdStr } =
      await litContractsClient.mintCapacityCreditsNFT({
        daysUntilUTCMidnightExpiration: 2,
        requestsPerKilosecond: 80,
      });
    //const capacityTokenIdStr = "" hardcode if minting does not work
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        capacityTokenId: capacityTokenIdStr,
        dAppOwnerWallet: ethersSigner,
        delegateeAddresses: [ethersSigner.address as string],
        uses: "10",
      });
    console.log(capacityDelegationAuthSig);
    console.log("✅ Minted Capacity Delegation Authsig");

    console.log("🔄 Getting EOA Session Sigs...");
    const authNeededCallback = async (
      authCallbackParams: AuthCallbackParams
    ) => {
      if (!authCallbackParams.uri) {
        throw new Error("uri is required");
      }
      if (!authCallbackParams.expiration) {
        throw new Error("expiration is required");
      }

      if (!authCallbackParams.resourceAbilityRequests) {
        throw new Error("resourceAbilityRequests is required");
      }

      // Create the SIWE message
      const toSign = await createSiweMessageWithRecaps({
        expiration: authCallbackParams.expiration,
        litNodeClient: litNodeClient,
        nonce: await litNodeClient.getLatestBlockhash(),
        resources: authCallbackParams.resourceAbilityRequests,
        uri: authCallbackParams.uri,
        walletAddress: ethersSigner.address,
      });
      // Generate the authSig
      const authSig = await generateAuthSig({
        signer: ethersSigner,
        toSign,
      });
      return authSig;
    };

    // Create the session capability object
    const sessionCapabilityObject = newSessionCapabilityObject();
    // Define the Lit resource
    const litResource = new LitAccessControlConditionResource("*");

    // Add the capability to decrypt from the access control condition referred to by the
    // lit resource.
    sessionCapabilityObject.addCapabilityForResource(
      litResource,
      LitAbility.AccessControlConditionDecryption
    );
    // Get the session signatures
    const sessionSigs = await litNodeClient.getSessionSigs({
      authNeededCallback,
      capabilityAuthSigs: [capacityDelegationAuthSig],
      chain: "sepolia",
      resourceAbilityRequests: [
        {
          ability: LitAbility.AccessControlConditionDecryption,
          resource: litResource,
        },
      ],
      sessionCapabilityObject,
    });

    console.log("✅ Got EOA Session Sigs");

    console.log("🔄 Decrypting to file...");
    const decryptedFileBuffer = await decryptToFile(
      {
        ciphertext,
        dataToEncryptHash,
        chain: "sepolia",
        sessionSigs,
        evmContractConditions,
      },
      litNodeClient
    );
    console.log("✅ Decrypted file");

    return decryptedFileBuffer;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
