import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";

import { getEnv, mintPkp } from "./utils";
import { litActionCode } from "./litAction";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const runExample = async (pkpPublicKey?: string) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: true,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    let _pkpPublicKey = pkpPublicKey;
    if (pkpPublicKey === undefined || pkpPublicKey === "") {
      console.log("🔄 No PKP provided, minting a new one...");
      _pkpPublicKey = (await mintPkp(ethersSigner))!.publicKey;
      console.log(`✅ Minted PKP: ${_pkpPublicKey}`);
    } else {
      console.log(`⚠️ Using PKP: ${_pkpPublicKey}`);
    }

    console.log("🔄 Getting PKP Session Sigs...");
    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: _pkpPublicKey as string,
      authMethods: [
        await EthWalletProvider.authenticate({
          signer: ethersSigner,
          litNodeClient,
          expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        }),
      ],
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log("✅ Got PKP Session Sigs");

    console.log("🔄 Executing Lit Action...");
    const message = new Uint8Array(
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("Hello world")
      )
    );

    await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      code: litActionCode,
      jsParams: {
        toSign: message,
        publicKey: _pkpPublicKey,
        sigName: "sig",
      },
    });
    console.log("✅ Executed Lit Action");
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
