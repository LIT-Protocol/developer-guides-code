import { LitNodeClient, decryptFromJson, decryptToString } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from "ethers";
import {
  LitAbility,
  LitAccessControlConditionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";

const LIT_CAPACITY_CREDIT_TOKEN_ID = import.meta.env.VITE_CAPACITY_CREDIT_TOKEN_ID;
const LIT_NETWORK = LitNetwork.DatilTest;

export const decryptString = async (
  encryptedJson: string
) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    const ethersSigner = ethersProvider.getSigner();
    const address = await ethersSigner.getAddress();
    console.log(`✅ Connected to wallet: ${address}`);

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Connecting LitContracts client to the network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LIT_NETWORK,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to the network");

    let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (capacityTokenId === "" || capacityTokenId === undefined) {
      console.log("🔄 No Capacity Credit provided, minting a new one...");
      capacityTokenId = (
        await litContracts.mintCapacityCreditsNFT({
          requestsPerKilosecond: 10,
          daysUntilUTCMidnightExpiration: 1,
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
        dAppOwnerWallet: ethersSigner,
        capacityTokenId,
        delegateeAddresses: [await ethersSigner.getAddress()],
        uses: "1",
      });
    console.log("✅ Capacity Delegation Auth Sig created");

    console.log("🔄 Getting EOA Session Sigs...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 minutes
      capabilityAuthSigs: [capacityDelegationAuthSig],
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: LitAbility.AccessControlConditionDecryption,
        },
      ],
      authNeededCallback: async ({
        resourceAbilityRequests,
        expiration,
        uri,
      }) => {
        const toSign = await createSiweMessageWithRecaps({
          uri: uri!,
          expiration: expiration!,
          resources: resourceAbilityRequests!,
          walletAddress: address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });
    console.log("✅ Got EOA Session Sigs");

    console.log("🔄 Decrypting string...");
    const decryptionResult = await decryptFromJson(
      {
        litNodeClient,
        sessionSigs,
        parsedJsonData: JSON.parse(encryptedJson),
      },
    );
    console.log(`✅ Decrypted string: ${decryptionResult}`);
  } catch (error: any) {
    console.error(error.message);
  } finally {
    litNodeClient!.disconnect();
  }
};
