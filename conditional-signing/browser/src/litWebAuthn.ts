import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_ABILITY, AUTH_METHOD_TYPE } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitRelay, WebAuthnProvider } from "@lit-protocol/lit-auth-client";
import { LitPKPResource, LitActionResource } from "@lit-protocol/auth-helpers";
import * as ethers from "ethers";

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
    const options = await webAuthnProvider.register(); // register a new passkey
    console.log("✅ Registered a Passkey");

    console.log("🔄 Minting PKP...");
    const txHash = await webAuthnProvider.verifyAndMintPKPThroughRelayer(options, { permittedAuthMethodTypes: [AUTH_METHOD_TYPE.WebAuthn]}); // Issue, new options, authMethod from old passkey
    console.log("✅ Minted PKP:", txHash);

    const authMethod = await webAuthnProvider.authenticate();
    const authMethodId = await webAuthnProvider.getAuthMethodId(authMethod);

    const pkps = await webAuthnProvider.getPKPsForAuthMethod({authMethodId, authMethodType: AUTH_METHOD_TYPE.WebAuthn});
    const pkp = pkps[0];
    console.log(pkp);
    console.log("pkpPubkey", pkp.publicKey);
    const sessionSigs = await litNodeClient.getPkpSessionSigs({
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
    console.log("✅ Got PKP Session Sigs", sessionSigs);

    const toSign = ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("The answer to the universe is 42.")));

    const litActionResponse = await litNodeClient.executeJs({
      code: litActionCode,
      sessionSigs,
      jsParams: {
        toSign,
        publicKey: pkp.publicKey.slice(2),
      }
    })
    console.log(litActionResponse);
    /*
    const { startRegistration } = await import('@simplewebauthn/browser');
    const attResp = await startRegistration(options);
    console.log("accessToken", authMethod.accessToken);
    const webauthnpub = WebAuthnProvider.getPublicKeyFromRegistration(attResp)
    console.log("Web Authn Pub", webauthnpub);

    const receipt = await litContracts.addPermittedAuthMethod({
      pkpTokenId: pkp.tokenId,
      authMethodType: 3,
      authMethodId,
      authMethodScopes: [AUTH_METHOD_SCOPE.SignAnything],
      webAuthnPubkey: WebAuthnProvider.getPublicKeyFromRegistration(
        JSON.parse(authMethod.accessToken)
      ),
    });
    console.log(receipt);
    */
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
    console.log(webAuthnProvider);
    console.log(authMethod);
    console.log(await webAuthnProvider.computePublicKeyFromAuthMethod(authMethod));
    console.log("✅ Authenticated WebAuthnProvider");

    const authMethodId = await webAuthnProvider.getAuthMethodId(authMethod);
    const pkps = await webAuthnProvider.getPKPsForAuthMethod({authMethodId, authMethodType: AUTH_METHOD_TYPE.WebAuthn});
    const pkp = pkps[0];

    /*
    const receipt = await litContracts.addPermittedAuthMethod({
      pkpTokenId: pkp.tokenId,
      authMethodType: 3,
      authMethodId,
      authMethodScopes: [AUTH_METHOD_SCOPE.SignAnything],
     webAuthnPubkey: pkp.publicKey//"0x" + await webAuthnProvider.computePublicKeyFromAuthMethod(authMethod),
    });
    console.log(receipt);
    */

    const sessionSigs = await litNodeClient.getPkpSessionSigs({
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
    console.log("✅ Got PKP Session Sigs", sessionSigs);

    const toSign = ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("The answer to the universe is 42.")));

    const litActionResponse = await litNodeClient.executeJs({
      code: litActionCode,
      sessionSigs,
      jsParams: {
        toSign,
        publicKey: pkp.publicKey.slice(2),
      }
    })
    console.log(litActionResponse);

  } catch (error) {
    console.error(error);
  } 
};
