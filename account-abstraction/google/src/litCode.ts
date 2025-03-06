import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK } from "@lit-protocol/constants";
import { LitRelay, GoogleProvider, getProviderFromUrl } from "@lit-protocol/lit-auth-client";

export const litGoogleOAuth = async () => {
  try {
    console.log("🔄 Connecting to the Lit network...");
    const litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to the Lit network");

    console.log("🔄 Initializing LitAuthClient and GoogleProvider...");
    const litRelay = new LitRelay({
        // Request a Lit Relay Server API key here: https://forms.gle/RNZYtGYTY9BcD9MEA
        relayApiKey: "<Your Lit Relay Server API Key>",
    });

    const googleProvider = new GoogleProvider({
      relay: litRelay,
      litNodeClient
    })
    console.log("✅ Initialized LitAuthClient and GoogleProvider");

    if (getProviderFromUrl() !== "google") {
      console.log("🔄 Signing in with Google...");
      googleProvider.signIn();
      console.log("✅ Signed in with Google");
    } else {
      console.log("🔄 Google Sign-in Valid, authenticating...")
    }

    const authMethod = await googleProvider.authenticate();
    console.log("✅ Authenticated with Google");

    console.log("**LOGGING FOR DEBUGGING PURPOSES, DO NOT EXPOSE**", authMethod);
  } catch (error) {
    console.error("Failed to connect to Lit Network:", error);
  }
};
