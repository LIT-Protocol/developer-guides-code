import { LitNetwork } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import * as ethers from "ethers";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { importPrivateKey } from "@lit-protocol/wrapped-keys";

const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const mintPkp = async (ethersSigner: ethers.Wallet) => {
  try {
    console.log("Minting new PKP...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.Cayenne,
    });
    await litContracts.connect();

    const pkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
    console.log(
      `Minted new PKP with public key: ${pkp.publicKey} and ETH address: ${pkp.ethAddress}`
    );
    return pkp;
  } catch (error) {
    console.error(error);
  }
};

export const importKeyAndGetPkpAddress = async (pkpPublicKey: string) => {
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

    console.log("Importing private key...");
    const pkpAddress = await importPrivateKey({
      pkpSessionSigs,
      privateKey: ETHEREUM_PRIVATE_KEY,
      litNodeClient,
    });
    console.log(`Imported private key, got PKP Address: ${pkpAddress}`);
    return pkpAddress;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient.disconnect();
  }
};
