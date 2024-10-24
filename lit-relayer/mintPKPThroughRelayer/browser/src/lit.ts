import { LitAuthClient } from "@lit-protocol/lit-auth-client";
import {
  AuthMethodType,
  LIT_RPC,
  LitNetwork,
  ProviderType,
} from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

export const mintPkpUsingGoogleAndLitRelayer = async (credentialResponse: {
  credential: string;
  clientId: string;
}) => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: true,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    const litAuthClient = new LitAuthClient({
      debug: false,
      litRelayConfig: {
        relayApiKey: import.meta.env.VITE_LIT_RELAYER_API_KEY,
      },
      rpcUrl: LIT_RPC.CHRONICLE_YELLOWSTONE,
      litNodeClient,
    });
    const googleProvider = litAuthClient.initProvider(ProviderType.Google);

    console.log("🔄 Minting PKP through Lit Relayer...");
    const txHash = await googleProvider.mintPKPThroughRelayer({
      authMethodType: AuthMethodType.Google,
      accessToken: credentialResponse.credential,
    });
    const result = await googleProvider.relay.pollRequestUntilTerminalState(
      txHash
    );
    console.log("✅ PKP minted successfully:", result);

    return {
      tokenId: result.pkpTokenId,
      ethAddress: result.pkpEthAddress,
      publicKey: result.pkpPublicKey,
    };
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
