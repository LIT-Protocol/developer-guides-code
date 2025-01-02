import * as ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LIT_NETWORK, LIT_ABILITY } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";

import { getEnv, mintPkp } from "./utils";
import { litActionCode } from "./litAction";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const runExample = async () => {
  let litNodeClient: LitNodeClient;
  
  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    const pkpInfo = await mintPkp(ethersSigner);

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");



    console.log("🔄 Getting Session Signatures...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LIT_ABILITY.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LIT_ABILITY.LitActionExecution,
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
          walletAddress: ethersSigner.address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });
    console.log("✅ Got Session Signatures");

    console.log("🔄 Executing Lit Action...");
    const message = new Uint8Array(
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("Hello world")
      )
    );
    const litActionSignatures = await litNodeClient.executeJs({
      sessionSigs,
      code: litActionCode,
      jsParams: {
        toSign: message,
        publicKey: pkpInfo?.publicKey,
        sigName: "sig",
      },
    });
    console.log("✅ Executed Lit Action");

    return litActionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
