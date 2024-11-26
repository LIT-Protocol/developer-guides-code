import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, ProviderType } from "@lit-protocol/constants";
import { LitAuthClient, DiscordProvider, getProviderFromUrl } from "@lit-protocol/lit-auth-client";

export const litDiscordOAuth = async () => {
  try {
    console.log("🔄 Connecting to the Lit network...");
    const litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to the Lit network");

    console.log("🔄 Initializing LitAuthClient and DiscordProvider...");
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: "<Your Lit Relay Server API Key>",
      },
      litNodeClient,
    });
    const discordProvider = litAuthClient.initProvider<DiscordProvider>(
      ProviderType.Discord
    );
    console.log("✅ Initialized LitAuthClient and DiscordProvider");

    if (getProviderFromUrl() !== "discord") {
      console.log("🔄 Signing in with Discord...");
      discordProvider.signIn();
      console.log("✅ Signed in with Discord");
    } else {
      console.log("🔄 Discord Sign-in Valid, authenticating...")
    }

    const authMethod = await discordProvider.authenticate();
    console.log("✅ Authenticated with Discord");

    console.log("**LOGGING FOR DEBUGGING PURPOSES, DO NOT EXPOSE**", authMethod);
  } catch (error) {
    console.error("Failed to connect to Lit Network:", error);
  }
};
