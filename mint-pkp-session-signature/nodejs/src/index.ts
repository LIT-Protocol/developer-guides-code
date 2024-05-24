import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitAbility, LitPKPResource } from "@lit-protocol/auth-helpers";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";

const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

(async () => {
  let litNodeClient;

  try {
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Cayenne,
    });
    await litNodeClient.connect();

    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.Cayenne,
    });

    await litContracts.connect();

    const mintedPkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;

    console.log("mintedPkp", mintedPkp);

    const authMethod = await EthWalletProvider.authenticate({
      signer: ethersSigner,
      litNodeClient,
    });

    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: mintedPkp.publicKey,
      authMethods: [authMethod],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
      ],
    });
    console.log("pkpSessionSigs", pkpSessionSigs);
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient?.disconnect();
  }
})();
