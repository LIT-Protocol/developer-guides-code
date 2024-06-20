import { LitNetwork } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import * as ethers from "ethers";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import {
  EthereumLitTransaction,
  NETWORK_EVM,
  signTransactionWithEncryptedKey,
} from "@lit-protocol/wrapped-keys";

const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const signWithEncryptedKeyUsingPkp = async (pkpPublicKey: string) => {
  let litNodeClient;

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
      debug: true,
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
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log("Got PKP Session Sigs");

    const unsignedTransaction: EthereumLitTransaction = {
      toAddress: await ethersSigner.getAddress(),
      value: "0.000000000000000001", // 1 wei (Lit tokens)
      chainId: 175177, // Chronicle
      // gasPrice: "0.001",
      // gasLimit: 21000,
      dataHex: ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes("Test transaction from Alice to Bob")
      ),
      chain: "chronicleTestnet",
    };

    return signTransactionWithEncryptedKey({
      pkpSessionSigs,
      network: NETWORK_EVM,
      unsignedTransaction,
      broadcast: true,
      litNodeClient,
    });
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient.disconnect();
  }
};
