import { LitNetwork, LIT_RPC } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  LitAbility,
  LitAccessControlConditionResource,
  createSiweMessage,
  generateAuthSig,
  LitResourceAbilityRequest,
  ResourceAbilityRequestBuilder,
} from "@lit-protocol/auth-helpers";
import * as ethers from "ethers";
import { LocalStorage } from "node-localstorage";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY1 = getEnv("ETHEREUM_PRIVATE_KEY1");
const ETHEREUM_PRIVATE_KEY2 = getEnv("ETHEREUM_PRIVATE_KEY2");

export const getSessionSigsViaAuthSig = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner1 = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY1,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    const ethersSigner2 = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY2,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilTest,
      debug: false,
      storageProvider: {
        provider: new LocalStorage("./lit_storage.db"),
      },
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    const genAuthSig = async (
      {
        expiration,
        resourceAbilityRequests,
      }: {
        expiration: string;
        resourceAbilityRequests: LitResourceAbilityRequest[];
      },
      ethersSigner: ethers.Wallet
    ) => {
      const toSign = await createSiweMessage({
        uri: "lit:" + litNodeClient.getSessionKey().publicKey,
        expiration,
        resources: resourceAbilityRequests,
        walletAddress: ethersSigner.address,
        nonce: await litNodeClient.getLatestBlockhash(),
        litNodeClient,
      });
      const res = await generateAuthSig({
        signer: ethersSigner,
        toSign,
      });
      res.derivedVia = "EIP1271";
      return res;
    };

    console.log("🔄 Getting Session Sigs via an Auth Sig...");
    const sessionSignatures = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      capabilityAuthSigs: [
        await genAuthSig(
          {
            expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
            resourceAbilityRequests: [
              {
                resource: new LitAccessControlConditionResource("*"),
                ability: LitAbility.AccessControlConditionDecryption,
              },
            ],
          },
          ethersSigner2
        ),
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource("*"),
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
          walletAddress: ethersSigner1.address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        const res = await generateAuthSig({
          signer: ethersSigner1,
          toSign,
        });
        res.derivedVia = "EIP1271";
        return res;
      },
    });
    console.log("✅ Got Session Sigs via an Auth Sig");
    console.log(sessionSignatures);
    return sessionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
