import { LitNetwork } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNodeClientNodeJs } from "@lit-protocol/lit-node-client-nodejs";
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
const LIT_PKP_PUBLIC_KEY = process.env.LIT_PKP_PUBLIC_KEY;

export const importKey = async () => {
  let litNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    litNodeClient = new LitNodeClientNodeJs({
      litNetwork: LitNetwork.Cayenne,
    });
    await litNodeClient.connect();

    let pkpPublicKey = LIT_PKP_PUBLIC_KEY;
    if (pkpPublicKey === undefined || pkpPublicKey === "") {
      console.log("Minting new PKP...");
      const litContracts = new LitContracts({
        signer: ethersSigner,
        network: LitNetwork.Cayenne,
      });

      await litContracts.connect();
      pkpPublicKey = (await litContracts.pkpNftContractUtils.write.mint()).pkp
        .publicKey;
      console.log(`Minted new PKP with public key: ${pkpPublicKey}`);
    }

    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey,
      authMethods: [
        await EthWalletProvider.authenticate({
          signer: ethersSigner,
          litNodeClient,
          expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
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
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    });

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs,
      privateKey: ETHEREUM_PRIVATE_KEY,
      litNodeClient,
    });

    console.log("pkpAddress", pkpAddress);
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient.disconnect();
  }
};
