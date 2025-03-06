import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, ProviderType } from "@lit-protocol/constants";
import {
  LitAuthClient,
  StytchOtpProvider,
} from "@lit-protocol/lit-auth-client";
import { StytchUIClient } from "@stytch/vanilla-js";

import {getEnv } from "./utils";

const STYTCH_PUBLIC_TOKEN = getEnv("VITE_STYTCH_PUBLIC_TOKEN");
const STYTCH_PROJECT_ID = getEnv("VITE_STYTCH_PROJECT_ID");

const stytchSmsAuth = async () => {
  const client = new StytchUIClient(STYTCH_PUBLIC_TOKEN);

  const phoneNumber = prompt("Enter your phone number");

  console.log("🔄 Requesting WhatsApp OTP from Stytch...");
  const stytchResponse = await client.otps.whatsapp.loginOrCreate(phoneNumber!);
  console.log("✅ Sent WhatsApp OTP request to Stytch");

  const otpResponse = prompt("Enter the code sent to your phone:");

  console.log("🔄 Authenticating with Stytch...");
  const authResponse = await client.otps.authenticate(
    otpResponse!,
    stytchResponse.method_id,
    {
      session_duration_minutes: 60,
    }
  );
  console.log("✅ Authenticated with Stytch");

  console.log("🔄 Connecting to the Lit network...");
  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
    debug: true,
  });

  await litNodeClient.connect();
  console.log("✅ Connected to the Lit network");

  console.log("🔄 Initializing LitAuthClient...");
  const litAuthClient = new LitAuthClient({
    litRelayConfig: {
      relayApiKey: "<Your Lit Relay Server API Key>",
    },
    litNodeClient,
  });
  console.log("✅ Initialized LitAuthClient");
  
  console.log("🔄 Initializing Stytch Provider...");
  const stytchProvider = litAuthClient.initProvider<StytchOtpProvider>(
    ProviderType.StytchWhatsAppFactorOtp,
    {
      userId: authResponse.user_id,
      appId: STYTCH_PROJECT_ID!,
    }
  );
  console.log("✅ Initialized Stytch Provider");

  console.log("🔄 Authenticating with Stytch SMS OTP...");
  const authMethod = await stytchProvider.authenticate({
    accessToken: authResponse.session_jwt,
  });
  console.log("✅ Authenticated with Stytch SMS OTP");

  console.log("**LOGGING FOR DEBUGGING PURPOSES, DO NOT EXPOSE**", authMethod);
};

export { stytchSmsAuth };
