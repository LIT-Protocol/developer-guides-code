import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK} from "@lit-protocol/constants";
import { LitRelay, WebAuthnProvider } from "@lit-protocol/lit-auth-client";

export const litWebAuthnOAuthRegister = async () => {
  let litNodeClient: LitNodeClient;
  try {
    console.log("🔄 Connecting to the Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to the Lit network");

    console.log("🔄 Initializing LitAuthClient and WebAuthnProvider...");
    const litRelay = new LitRelay({
      relayUrl: LitRelay.getRelayUrl(LIT_NETWORK.DatilDev),
      relayApiKey: 'test-api-key',
    });

    const webAuthnProvider = new WebAuthnProvider({
      relay: litRelay,
      litNodeClient,
    });

    console.log("🔄 Acquiring passkey options...");
    const options = await webAuthnProvider.register();
    console.log("✅ Acquired passkey options");

    console.log("🔄 Creating passkey and minting PKP...");
    const txHash = await webAuthnProvider.verifyAndMintPKPThroughRelayer(options);
    console.log("✅ Created passkey and minted PKP:", txHash);
  } catch (error) {
    console.error("Failed to connect to Lit Network:", error);
  }
  finally {
    litNodeClient!.disconnect();
  }
};

export const litWebAuthnOAuthAuthenticate = async () => {
  let litNodeClient: LitNodeClient;
  try {
    console.log("🔄 Connecting to the Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to the Lit network");

    console.log("🔄 Initializing LitAuthClient and WebAuthnProvider...");
    const litRelay = new LitRelay({
      relayUrl: LitRelay.getRelayUrl(LIT_NETWORK.DatilDev),
      relayApiKey: 'test-api-key',
    });

    const webAuthnProvider = new WebAuthnProvider({
      relay: litRelay,
      litNodeClient,
    });

    console.log("🔄 Authenticating with passkey...");
    const authMethod = await webAuthnProvider.authenticate();
    console.log("✅ Authenticated with passkey");

    console.log("**LOGGING FOR DEBUGGING PURPOSES, DO NOT EXPOSE**", authMethod);
  } catch (error) {
    console.error("Failed to connect to Lit Network:", error);
  }
  finally {
    litNodeClient!.disconnect();
  }
};

