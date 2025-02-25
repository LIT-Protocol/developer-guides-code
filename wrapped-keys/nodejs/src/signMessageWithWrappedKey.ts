import * as ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LIT_NETWORK } from "@lit-protocol/constants";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { LitActionResource, LitAbility } from "@lit-protocol/auth-helpers";
import { api } from "@lit-protocol/wrapped-keys";
import { LIT_NETWORKS_KEYS } from "@lit-protocol/types";

const { signMessageWithEncryptedKey } = api;

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const signMessageWithWrappedKey = async (
  pkpPublicKey: string,
  evmOrSolana: "evm" | "solana",
  wrappedKeyId: string,
  messageToSign: string | Uint8Array
) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev as LIT_NETWORKS_KEYS,
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

    console.log("🔄 Signing message with Wrapped Key...");
    const signedMessage = await signMessageWithEncryptedKey({
      pkpSessionSigs,
      network: evmOrSolana,
      id: wrappedKeyId,
      messageToSign,
      litNodeClient,
    });
    console.log("✅ Signed message");
    return signedMessage;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
