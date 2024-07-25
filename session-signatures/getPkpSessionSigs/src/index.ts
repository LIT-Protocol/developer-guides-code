import { getEnv } from "./utils";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, ProviderType, LIT_RPC } from "@lit-protocol/constants";
import {
  EthWalletProvider,
  LitAuthClient,
} from "@lit-protocol/lit-auth-client";
import { LitAbility, LitPKPResource } from "@lit-protocol/auth-helpers";
import * as ethers from "ethers";
import { LocalStorage } from "node-localstorage";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const LIT_RELAYER_API_KEY = getEnv("LIT_RELAYER_API_KEY");

export const getSessionSigsPKP = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
      storageProvider: {
        provider: new LocalStorage("./lit_storage.db"),
      },
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    console.log(
      "🔄 Initializing LitAuthClient for authentication through Lit login..."
    );
    const litAuthClient = new LitAuthClient({
      debug: false,
      litRelayConfig: {
        relayApiKey: LIT_RELAYER_API_KEY,
      },
      rpcUrl: LIT_RPC.CHRONICLE_YELLOWSTONE,
      litNodeClient,
    });
    console.log("✅ Successfully initialized LitAuthClient instance");

    console.log(
      "🔄 Authenticating EthWallerProvider, generating an Auth Method..."
    );

    const authMethod = await EthWalletProvider.authenticate({
      signer: ethersSigner,
      litNodeClient,
    });

    console.log(
      "✅ Successfully authenticated EthWallerProvider, generated Auth Method"
    );

    console.log("🔄 Minting a PKP using Auth Method...");

    const pkp = await litAuthClient.mintPKPWithAuthMethods([authMethod], {});

    console.log("✅ Successfully minted a PKP using the Auth Method");

    console.log("🔄 Getting the Session Sigs for the PKP...");
    const sessionSignatures = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: pkp.pkpPublicKey!,
      authMethods: [authMethod],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
    });
    console.log("✅ Got PKP Session Sigs");
    return sessionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
