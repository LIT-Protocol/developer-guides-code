import { getEnv } from "./utils";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  AuthMethodScope,
  LitNetwork,
  ProviderType,
  LIT_RPC,
} from "@lit-protocol/constants";
import {
  EthWalletProvider,
  LitAuthClient,
} from "@lit-protocol/lit-auth-client";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import * as ethers from "ethers";
import { LocalStorage } from "node-localstorage";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const LIT_RELAYER_API_KEY = getEnv("LIT_RELAYER_API_KEY");

export const getSessionSigsLitAction = async () => {
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
      "🔄 Authenticating EthWalletProvider, generating an Auth Method..."
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

    const litActionCode = `const go = async () => {
      Lit.Actions.setResponse({ response: "true" });
   };
   
   go();
   `;
    console.log("🔄 Getting Session Sigs...");
    const sessionSignatures = await litNodeClient.getLitActionSessionSigs({
      pkpPublicKey: pkp.pkpPublicKey!,
      authMethods: [authMethod],
      chain: "ethereum",
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
      litActionCode: Buffer.from(litActionCode).toString("base64"),
      jsParams: {},
    });
    console.log("✅ Got Session Sigs");
    return sessionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
