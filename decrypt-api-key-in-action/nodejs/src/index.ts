<<<<<<< HEAD
import { LitNodeClient, encryptString } from "@lit-protocol/lit-node-client";
import { LitNetwork, LIT_RPC } from "@lit-protocol/constants";
import {
  createSiweMessage,
  LitAbility,
  LitAccessControlConditionResource,
  LitActionResource,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { AccessControlConditions } from "@lit-protocol/types";
import * as ethers from "ethers";

import { litActionCode } from "./litAction";
import { getEnv } from "./utils";

const LIT_NETWORK = LitNetwork.DatilTest;
const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const LIT_CAPACITY_CREDIT_TOKEN_ID =
  process.env["LIT_CAPACITY_CREDIT_TOKEN_ID"];

export const decryptApiKey = async (alchemyUrl: string, key: string) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersWallet = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting to the Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to the Lit network");

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersWallet,
      network: LIT_NETWORK,
      debug: false,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (capacityTokenId === "" || capacityTokenId === undefined) {
      console.log("🔄 No Capacity Credit provided, minting a new one...");
      capacityTokenId = (
        await litContracts.mintCapacityCreditsNFT({
          requestsPerKilosecond: 10,
          daysUntilUTCMidnightExpiration: 1,
        })
      ).capacityTokenIdStr;
      console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    } else {
      console.log(
        `ℹ️  Using provided Capacity Credit with ID: ${LIT_CAPACITY_CREDIT_TOKEN_ID}`
      );
    }

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersWallet,
        capacityTokenId,
        delegateeAddresses: [ethersWallet.address],
        uses: "1",
      });
    console.log("✅ Capacity Delegation Auth Sig created");

    const accessControlConditions: AccessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "eth_getBalance",
        parameters: [":userAddress", "latest"],
        returnValueTest: {
          comparator: ">=",
          value: "0",
        },
      },
    ];

    console.log("🔐 Encrypting the API key...");
    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        accessControlConditions,
        dataToEncrypt: key,
      },
      litNodeClient
    );
    console.log("✅ Encrypted the API key");
    console.log("ℹ️  The base64-encoded ciphertext:", ciphertext);
    console.log(
      "ℹ️  The hash of the data that was encrypted:",
      dataToEncryptHash
    );

    console.log("🔄 Generating the Resource String...");
    const accsResourceString =
      await LitAccessControlConditionResource.generateResourceString(
        accessControlConditions as any,
        dataToEncryptHash
      );
    console.log("✅ Generated the Resource String");

    console.log("🔄 Getting the Session Signatures...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      capabilityAuthSigs: [capacityDelegationAuthSig],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource(accsResourceString),
          ability: LitAbility.AccessControlConditionDecryption,
        },
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }) => {
        const toSign = await createSiweMessage({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: ethersWallet.address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersWallet,
          toSign,
        });
      },
    });
    console.log("✅ Generated the Session Signatures");

    console.log("🔄 Executing the Lit Action...");
    const litActionSignatures = await litNodeClient.executeJs({
      sessionSigs,
      code: litActionCode,
      jsParams: {
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
        alchemyUrl,
      },
    });
    console.log("✅ Executed the Lit Action");

    return litActionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
=======
//@ts-nocheck
import { LitNodeClient, encryptString } from "@lit-protocol/lit-node-client";
import { AuthCallbackParams } from "@lit-protocol/types";
import { LIT_RPC } from "@lit-protocol/constants";
import { LitAbility, LitAccessControlConditionResource, LitActionResource, createSiweMessageWithRecaps, generateAuthSig } from "@lit-protocol/auth-helpers";
import {ethers} from 'ethers';

const url = `<your http endpoint for api-key usage>`;
const key = '<your api key>';

const genActionSource = (url: string) => {
    return `(async () => {
        const apiKey = await Lit.Actions.decryptAndCombine({
            accessControlConditions,
            ciphertext,
            dataToEncryptHash,
            authSig: null,
            chain: 'ethereum',
        });
        // Note: uncomment this functionality to use your api key that is for the provided url
        /*
        const resp = await fetch("${url}", {
            'Authorization': "Bearer " + apiKey
        });
        let data = await resp.json();
        */
        Lit.Actions.setResponse({ response: apiKey });
    })();`;
}

const ONE_WEEK_FROM_NOW = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7
).toISOString();

const genProvider = () => {
    return new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE);
}

const genWallet = () => {
// known private key for testing
// replace with your own key
return new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', genProvider());
}

const genAuthSig = async (
    wallet: ethers.Wallet,
    client: LitNodeClient,
    uri: string,
    resources: LitResourceAbilityRequest[]
) => {

    let blockHash = await client.getLatestBlockhash();
    const message = await createSiweMessageWithRecaps({
        walletAddress: wallet.address,
        nonce: blockHash,
        litNodeClient: client,
        resources,
        expiration: ONE_WEEK_FROM_NOW,
        uri
    })
    const authSig = await generateAuthSig({
        signer: wallet,
        toSign: message,
        address: wallet.address
    });


    return authSig;
}

const genSession = async (
    wallet: ethers.Wallet,
    client: LitNodeClient,
    resources: LitResourceAbilityRequest[]) => {
    let sessionSigs = await client.getSessionSigs({
        chain: "ethereum",
        resourceAbilityRequests: resources,
        authNeededCallback: async (params: AuthCallbackParams) => {
          console.log("resourceAbilityRequests:", params.resources);

          if (!params.expiration) {
            throw new Error("expiration is required");
          }
  
          if (!params.resources) {
            throw new Error("resourceAbilityRequests is required");
          }
  
          if (!params.uri) {
            throw new Error("uri is required");
          }

          // generate the authSig for the inner signature of the session
          // we need capabilities to assure that only one api key may be decrypted
          const authSig = genAuthSig(wallet, client, params.uri, params.resourceAbilityRequests ?? []);
          return authSig;
        }
    });

    return sessionSigs;
}

const main = async () => {
    let client = new LitNodeClient({
        litNetwork: LitNetwork.DatilDev,
        debug: true
    });

    const wallet = genWallet();
    const chain = 'ethereum';
    // lit action will allow anyone to decrypt this api key with a valid authSig
    const accessControlConditions = [
        {
            contractAddress: '',
            standardContractType: '',
            chain,
            method: 'eth_getBalance',
            parameters: [':userAddress', 'latest'],
            returnValueTest: {
                comparator: '>=',
                value: '0',
            },
        },
    ];
    

    await client.connect();
    /*
    Here we are encypting our key for secure use within an action
    this code should be run once and the ciphertext and dataToEncryptHash stored for later sending
    to the Lit Action in 'jsParams'
    */
    const { ciphertext, dataToEncryptHash } = await encryptString(
        {
            accessControlConditions,
            dataToEncrypt: key,
        },
        client
    );

    console.log("cipher text:", ciphertext, "hash:", dataToEncryptHash);
    const accsResourceString = 
        await LitAccessControlConditionResource.generateResourceString(accessControlConditions as any, dataToEncryptHash);
    const sessionForDecryption = await genSession(wallet, client, [
        {
            resource: new LitActionResource('*'),
            ability: LitAbility.LitActionExecution,
        },
        {
            resource: new LitAccessControlConditionResource(accsResourceString),
            ability: LitAbility.AccessControlConditionDecryption,

        }
    ]
    );
    console.log("action source code: ", genActionSource(url))
    /*
    Here we use the encrypted key by sending the
    ciphertext and dataTiEncryptHash to the action
    */ 
    const res = await client.executeJs({
        sessionSigs: sessionForDecryption,
        code: genActionSource(url),
        jsParams: {
            accessControlConditions,
            ciphertext,
            dataToEncryptHash
        }
    });

    console.log("result from action execution:", res);
    client.disconnect();
}

await main();
>>>>>>> 314a19b (refactor: changed dir structure for decrypt-api-key-in-action as per templates)
