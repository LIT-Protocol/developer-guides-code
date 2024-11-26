import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, ProviderType } from "@lit-protocol/constants";
import { LitAuthClient, GoogleProvider, getProviderFromUrl } from "@lit-protocol/lit-auth-client";
import { LitActionResource, LitAbility } from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";

const saveTimingData = (timings: Record<string, number>) => {
  const timestamp = new Date().toISOString();
  
  const values = [
    timestamp,
    timings['Total Execution'],
    timings['Lit Network Connection'],
    timings['Auth Client Initialization'],
    timings['Google Authentication'],
    timings['PKP Fetch'],
    timings['LitContracts Initialization'],
    timings['Get Permitted AuthMethods'],
    timings['Get Session Signatures']
  ].join('\t');

  console.log('=== HEADERS ===');
  console.log('Timestamp\tTotal Execution\tLit Network Connection\tAuth Client Initialization\tGoogle Authentication\tPKP Fetch\tLitContracts Initialization\tGet Permitted AuthMethods\tGet Session Signatures');
  
  console.log('=== VALUES ===');
  console.log(values);
};

export const litGoogleOAuth = async () => {
  const timings: Record<string, number> = {};
  const timeOperation = async (name: string, operation: () => Promise<any>) => {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    timings[name] = end - start;
    console.log(`${name}: ${timings[name].toFixed(2)}ms`);
    return result;
  };

  try {
    const totalStart = performance.now();

    console.log("🔄 Connecting to the Lit network...");
    const litNodeClient = await timeOperation('Lit Network Connection', async () => {
      const client = new LitNodeClient({
        litNetwork: LitNetwork.Datil,
        debug: false,
      });
      await client.connect();
      return client;
    });
    console.log("✅ Connected to the Lit network");

    console.log("🔄 Initializing LitAuthClient and GoogleProvider...");
    const { googleProvider } = await timeOperation('Auth Client Initialization', async () => {
      const authClient = new LitAuthClient({
        litRelayConfig: {
          relayApiKey: "<Your Lit Relay Server API Key>",
        },
        litNodeClient,
      });
      const provider = authClient.initProvider<GoogleProvider>(ProviderType.Google);
      return { litAuthClient: authClient, googleProvider: provider };
    });
    console.log("✅ Initialized LitAuthClient and GoogleProvider");

    if (getProviderFromUrl() !== "google") {
      console.log("🔄 Signing in with Google...");
      await timeOperation('Google Sign-in', async () => {
        googleProvider.signIn();
      });
      console.log("✅ Signed in with Google");
    } else {
      console.log("🔄 Google Sign-in Valid, authenticating...")
    }

    const authMethod = await timeOperation('Google Authentication', () => 
      googleProvider.authenticate()
    );
    console.log("✅ Authenticated with Google");

    const { pkp, pkps } = await timeOperation('PKP Fetch', async () => {
      const fetchedPkps = await googleProvider.fetchPKPsThroughRelayer(authMethod);
      return { pkp: fetchedPkps[fetchedPkps.length - 1], pkps: fetchedPkps };
    });
    console.log("✅ Fetched PKP", pkps);

    console.log("🔄 Initializing LitContracts...");
    const litContracts = await timeOperation('LitContracts Initialization', async () => {
      const contracts = new LitContracts({
        debug: false,
        network: LitNetwork.Datil,
      });
      await contracts.connect();
      return contracts;
    });
    console.log("✅ Initialized LitContracts");

    const permittedAuthMethods = await timeOperation('Get Permitted AuthMethods', () =>
      litContracts.pkpPermissionsContract.read.getPermittedAuthMethods(pkp.tokenId)
    );
    console.log("✅ Retrieved permitted AuthMethods for PKP", permittedAuthMethods);

    const sessionSigs = await timeOperation('Get Session Signatures', () =>
      litNodeClient.getPkpSessionSigs({
        pkpPublicKey: pkp.publicKey,
        authMethods: [authMethod],
        resourceAbilityRequests: [
          {
            resource: new LitActionResource("*"),
            ability: LitAbility.LitActionExecution,
          },
        ],
      })
    );
    console.log("✅ Session Signatures", sessionSigs);

    const totalEnd = performance.now();
    timings['Total Execution'] = totalEnd - totalStart;
    console.log(`Total Execution: ${timings['Total Execution'].toFixed(2)}ms`);

    saveTimingData(timings);

  } catch (error) {
    console.error("Failed to connect to Lit Network:", error);
  }
};
