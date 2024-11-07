import { LitNodeClient, decryptFromJson } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from "ethers";
import {
  LitAbility,
  LitAccessControlConditionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";

const LIT_NETWORK = LitNetwork.DatilDev;

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

    console.log("🔄 Getting EOA Session Sigs...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 minutes
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
    const decryptedString = new TextDecoder().decode(decryptionResult)
    console.log(`✅ Decrypted string: ${decryptedString}`);
  } catch (error: any) {
    console.error(error.message);
  } finally {
    litNodeClient!.disconnect();
  }
};
