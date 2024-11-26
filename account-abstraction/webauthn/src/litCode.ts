import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, ProviderType } from "@lit-protocol/constants";
import { LitAuthClient, WebAuthnProvider } from "@lit-protocol/lit-auth-client";

export const litWebAuthnOAuth = async () => {
  try {
    console.log("🔄 Connecting to the Lit network...");
    const litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to the Lit network");

    console.log("🔄 Initializing LitAuthClient and WebAuthnProvider...");
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: "<Your Lit Relay Server API Key>",
      },
      litNodeClient,
    });
    const webAuthnProvider = litAuthClient.initProvider<WebAuthnProvider>(
      ProviderType.WebAuthn
    );
    console.log("✅ Initialized LitAuthClient and WebAuthnProvider");

    console.log("🔄 Acquiring passkey options...");
    const options = await webAuthnProvider.register();
    console.log("✅ Acquired passkey options");

    console.log("🔄 Creating passkey and minting PKP...");
    const txHash = await webAuthnProvider.verifyAndMintPKPThroughRelayer(options);
    console.log("✅ Created passkey and minted PKP:", txHash);

    console.log("🔄 Authenticating with passkey...");
    const authMethod = await webAuthnProvider.authenticate();
    console.log("✅ Authenticated with passkey");

    console.log("**LOGGING FOR DEBUGGING PURPOSES, DO NOT EXPOSE**", authMethod);
  } catch (error) {
    console.error("Failed to connect to Lit Network:", error);
  }
};
