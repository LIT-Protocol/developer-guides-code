import * as ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import {
  api,
  EthereumLitTransaction,
  SerializedTransaction,
  SignTransactionWithEncryptedKeyParams,
} from "@lit-protocol/wrapped-keys";

const { signTransactionWithEncryptedKey } = api;

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const signTransactionWithWrappedKey = async (
  pkpPublicKey: string,
  evmOrSolana: "evm" | "solana",
  wrappedKeyId: string,
  unsignedTransaction: EthereumLitTransaction | SerializedTransaction,
  broadcastTransaction: boolean
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

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersSigner,
        capacityTokenId: '59133',
        delegateeAddresses: [await ethersSigner.getAddress(), ethers.utils.computeAddress('0x' + pkpPublicKey)],
        uses: "1",
      });
    console.log("✅ Capacity Delegation Auth Sig created");

    console.log("🔄 Getting PKP Session Sigs...");
    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey,
        capabilityAuthSigs: [capacityDelegationAuthSig],
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

    console.log("🔄 Signing transaction with Wrapped Key...");
    const signedTransaction = await signTransactionWithEncryptedKey({
      pkpSessionSigs,
      network: evmOrSolana,
      id: wrappedKeyId,
      unsignedTransaction,
      broadcast: broadcastTransaction,
      litNodeClient,
    } as SignTransactionWithEncryptedKeyParams);
    console.log("✅ Signed transaction");
    return signedTransaction;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
