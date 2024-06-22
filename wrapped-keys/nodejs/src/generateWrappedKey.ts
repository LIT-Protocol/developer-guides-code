import * as ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import {
  generatePrivateKey,
  NETWORK_EVM,
  NETWORK_SOLANA,
} from "@lit-protocol/wrapped-keys";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const generateWrappedKey = async (
  pkpPublicKey: string,
  evmOrSolana: "evm" | "solana"
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

    console.log("Generating wrapped key...");
    const { pkpAddress, generatedPublicKey } = await generatePrivateKey({
      pkpSessionSigs,
      network: evmOrSolana === NETWORK_EVM ? NETWORK_EVM : NETWORK_SOLANA,
      litNodeClient,
    });
    console.log("Generated wrapped key");
    return { pkpAddress, generatedPublicKey };
  } catch (error) {
    console.error;
  } finally {
    litNodeClient!.disconnect();
  }
};
