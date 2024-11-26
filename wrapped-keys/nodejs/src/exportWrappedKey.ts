import * as ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import { api } from "@lit-protocol/wrapped-keys";

const { exportPrivateKey } = api;

import { getEnv } from "./utils";
import { Network } from "@lit-protocol/wrapped-keys/src/lib/types";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const exportWrappedKey = async (
  pkpPublicKey: string,
  wrappedKeyId: string,
  evmOrSolana: "evm" | "solana"
) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Datil,
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

    console.log("🔄 Exporting private key...");
    const exportedPrivateKey = await exportPrivateKey({
      pkpSessionSigs,
      litNodeClient,
      id: wrappedKeyId,
      network: evmOrSolana,
    });
    console.log("✅ Exported private key");
    return exportedPrivateKey;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
