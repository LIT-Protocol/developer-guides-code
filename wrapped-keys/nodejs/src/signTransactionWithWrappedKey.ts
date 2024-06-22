import * as ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import {
  LitTransaction,
  NETWORK_EVM,
  NETWORK_SOLANA,
  signTransactionWithEncryptedKey,
} from "@lit-protocol/wrapped-keys";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const signTransactionWithWrappedKey = async (
  pkpPublicKey: string,
  evmOrSolana: "evm" | "solana",
  litTransaction: LitTransaction,
  broadcastTransaction: boolean
) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    console.log("Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Cayenne,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("Connected to Lit network");

    console.log("Getting PKP Session Sigs...");
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
    console.log("Got PKP Session Sigs");

    console.log("Signing transaction with Wrapped Key...");
    const signedTransaction = await signTransactionWithEncryptedKey({
      pkpSessionSigs,
      network: evmOrSolana === NETWORK_EVM ? NETWORK_EVM : NETWORK_SOLANA,
      unsignedTransaction: litTransaction,
      broadcast: broadcastTransaction,
      litNodeClient,
    });
    console.log("Signed transaction");
    return signedTransaction;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
