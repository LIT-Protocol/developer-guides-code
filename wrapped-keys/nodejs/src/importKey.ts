import * as ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { api } from "@lit-protocol/wrapped-keys";

const { importPrivateKey } = api;

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const importKey = async (
  pkpPublicKey: string,
  privateKey: string,
  publicKey: string,
  keyType: "K256" | "ed25519"
) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Cayenne,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Getting PKP Session Sigs...");
    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey,
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

    console.log("🔄 Importing private key...");
    const pkpAddress = await importPrivateKey({
      pkpSessionSigs,
      litNodeClient,
      privateKey,
      publicKey,
      keyType,
    });
    console.log(
      `✅ Imported private key, and attached to PKP with address: ${pkpAddress}`
    );
    return pkpAddress;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
