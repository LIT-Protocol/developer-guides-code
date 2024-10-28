import {
  AUTH_METHOD_TYPE,
  LIT_NETWORK,
} from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitRelay, GoogleProvider } from '@lit-protocol/lit-auth-client';



export const mintPkpUsingGoogleAndLitRelayer = async (credentialResponse: {
  credential: string;
  clientId: string;
}) => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: true,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    const relay = new LitRelay({ 
      relayApiKey: import.meta.env.VITE_LIT_RELAYER_API_KEY 
    });

    const googleProvider = new GoogleProvider({ relay, litNodeClient });

    console.log("🔄 Minting PKP through Lit Relayer...");
    const txHash = await googleProvider.mintPKPThroughRelayer({
      authMethodType: AUTH_METHOD_TYPE.Google,
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
