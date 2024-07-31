import { expect } from "chai";
import ethers from "ethers";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

import { registerPayer } from "../src/registerPayer";
import { addUsers } from "../src/addUsers";
import { getEnv, mintPkp } from "../src/utils";
import {
  EthWalletProvider,
  LitAuthClient,
} from "@lit-protocol/lit-auth-client";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";

const LIT_RELAYER_API_KEY = getEnv("LIT_RELAYER_API_KEY");

describe("Generate a Wrapped Key using a payee PKP", () => {
  const payeeEthersSigner = ethers.Wallet.createRandom();

  it("should generate a Wrapped Key", async () => {
    let litNodeClient: LitNodeClient;

    try {
      console.log("🔄 Connecting to Lit network...");
      litNodeClient = new LitNodeClient({
        litNetwork: LitNetwork.DatilTest,
        debug: true,
      });
      await litNodeClient.connect();
      console.log("✅ Connected to Lit network");

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
        signer: payeeEthersSigner,
        litNodeClient,
      });
      console.log(
        "✅ Successfully authenticated EthWallerProvider, generated Auth Method"
      );

      console.log("🔄 Minting a PKP using Auth Method...");
      const payeePkpInfo = await litAuthClient.mintPKPWithAuthMethods(
        [authMethod],
        {}
      );
      console.log("✅ Successfully minted a PKP using the Auth Method");

      console.log("🔄 Getting the Session Sigs for the PKP...");
      const sessionSigs = await litNodeClient.getPkpSessionSigs({
        pkpPublicKey: payeePkpInfo.pkpPublicKey!,
        authMethods: [authMethod],
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
      console.log("✅ Got PKP Session Sigs");

      // const newPayerInfo = await registerPayer();
      await addUsers([payeePkpInfo.pkpEthAddress as string]);

      console.log("🔄 Executing simple Lit Action...");
      const result = await litNodeClient.executeJs({
        sessionSigs,
        code: `(() => console.log("The answer to the universe is 42."))();`,
      });
      console.log("✅ Executed simple Lit Action");

      console.log(result);
    } catch (error) {
      throw error;
    } finally {
      litNodeClient!.disconnect();
    }
  }).timeout(60_000);
});
