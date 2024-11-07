import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_ABILITY } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitRelay, WebAuthnProvider } from "@lit-protocol/lit-auth-client";
import { AuthMethod } from "@lit-protocol/types";
import { LitPKPResource, LitActionResource } from "@lit-protocol/auth-helpers";
import * as ethers from "ethers";

import { getEnv } from "./utils";
import { litActionCode } from "./litAction";

const LIT_NET = LIT_NETWORK.DatilDev;

export const register = async () => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NET,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    console.log("🔄 Connecting LitRelay...");
    const litRelay = new LitRelay({
      relayUrl: LitRelay.getRelayUrl(LIT_NET),
      relayApiKey: 'test-api-key',
    });
    console.log("✅ Connected LitRelay");

    console.log("🔄 Registering WebAuthnProvider...");
    const webAuthnProvider = new WebAuthnProvider({
      relay: litRelay,
      litNodeClient,
    });
    console.log("✅ Registered WebAuthnProvider");

    console.log("🔄 Registering a Passkey...");
    const options = await webAuthnProvider.register();
    console.log("✅ Registered a Passkey");

    console.log("🔄 Minting PKP...");
    const txHash = await webAuthnProvider.verifyAndMintPKPThroughRelayer(options);
    console.log("✅ Minted PKP:", txHash);
  } catch (error) {
    console.error(error);
  } 
};

export const authenticate = async () => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NET,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    console.log("🔄 Connecting LitRelay...");
    const litRelay = new LitRelay({
      relayUrl: LitRelay.getRelayUrl(LIT_NET),
      relayApiKey: 'test-api-key',
    });
    console.log("✅ Connected LitRelay");

    console.log("🔄 Registering WebAuthnProvider...");
    const webAuthnProvider = new WebAuthnProvider({
      relay: litRelay,
      litNodeClient,
    });
    const authMethod = await webAuthnProvider.authenticate();
    console.log("✅ Authenticated WebAuthnProvider");
    const pkps = await webAuthnProvider.fetchPKPs(authMethod);
    const pkp = pkps[0];
    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: pkp.publicKey,
      authMethods: [authMethod],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LIT_ABILITY.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LIT_ABILITY.LitActionExecution,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log("✅ Got PKP Session Sigs", pkpSessionSigs);

    const litActionResponse = await litNodeClient.executeJs({
      code: litActionCode,
      sessionSigs: pkpSessionSigs,
      jsParams: {
        toSign: ethers.utils.arrayify(
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("The answer to the universe is 42.")
          )
        ),
        publicKey: pkp.publicKey,
      }
    })
    console.log(litActionResponse);

  } catch (error) {
    console.error(error);
  } 
};
