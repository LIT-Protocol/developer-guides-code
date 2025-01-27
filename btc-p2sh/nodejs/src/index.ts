import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, LIT_RPC,  } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LIT_NETWORKS_KEYS } from "@lit-protocol/types";
import * as ethers from "ethers";

import { getEnv } from "./utils/utils";
import { singleSig } from "./p2sh/single-sig";
import { multiSig } from "./p2sh/multi-sig";
import { oneOfOneMultiSig } from "./p2sh/1of1-multi-sig";
import { collaborativeMultiSig } from "./p2sh/collaborative";

const PKP_PUBLIC_KEY_1 = getEnv("PKP_PUBLIC_KEY_1");
const PKP_PUBLIC_KEY_2 = getEnv("PKP_PUBLIC_KEY_2");
const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const BTC_DESTINATION_ADDRESS = getEnv("BTC_DESTINATION_ADDRESS");
const LIT_NETWORK = process.env["LIT_NETWORK"] as LIT_NETWORKS_KEYS || LitNetwork.Datil;
const LIT_CAPACITY_CREDIT_TOKEN_ID = process.env["LIT_CAPACITY_CREDIT_TOKEN_ID"];

const ethersWallet = new ethers.Wallet(
  ETHEREUM_PRIVATE_KEY,
  new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

const address = ethersWallet.address;

export const executeBtcSigning = async () => {
  let litNodeClient: LitNodeClient;

  try {
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();

    const litContracts = new LitContracts({
      signer: ethersWallet,
      network: LIT_NETWORK,
      debug: false,
    });
    await litContracts.connect();

    let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (!capacityTokenId) {
      console.log("🔄 No Capacity Credit provided, minting a new one...");
      const mintResult = await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 1,
      });
      capacityTokenId = mintResult.capacityTokenIdStr;
      console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    } else {
      console.log(`ℹ️  Using provided Capacity Credit with ID: ${LIT_CAPACITY_CREDIT_TOKEN_ID}`);
    }

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersWallet,
        capacityTokenId,
        delegateeAddresses: [address],
        uses: "1",
      });
    console.log("✅ Capacity Delegation Auth Sig created");

    console.log("🔄 Getting Session Signatures...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      capabilityAuthSigs: [capacityDelegationAuthSig],
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
          nonce: await litNodeClient!.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersWallet,
          toSign,
        });
      },
    });
    console.log("✅ Got Session Signatures");

    console.log("🔄 Executing Bitcoin Transaction...");
    return await singleSig(litNodeClient, sessionSigs, PKP_PUBLIC_KEY_1, BTC_DESTINATION_ADDRESS);

     /**
      * Single Sig P2SH: 
     return await singleSig(litNodeClient, sessionSigs, PKP_PUBLIC_KEY_1, BTC_DESTINATION_ADDRESS);

     * Multi Sig P2SH:
     return await multiSig(litNodeClient, sessionSigs, PKP_PUBLIC_KEY_1, PKP_PUBLIC_KEY_2, BTC_DESTINATION_ADDRESS);

     * 1of1 Multi Sig P2SH:
     return await oneOfOneMultiSig(litNodeClient, sessionSigs, PKP_PUBLIC_KEY_1, PKP_PUBLIC_KEY_2, BTC_DESTINATION_ADDRESS);

     * Collaborative Multi Sig P2SH:
     return await collaborativeMultiSig(litNodeClient, sessionSigs, PKP_PUBLIC_KEY_1, PKP_PUBLIC_KEY_2, BTC_DESTINATION_ADDRESS);
     */

  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
