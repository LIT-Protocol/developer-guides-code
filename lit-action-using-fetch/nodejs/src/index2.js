//@ts-nocheck
import { LitNodeClient, encryptString } from "@lit-protocol/lit-node-client";
import { LitAbility, LitAccessControlConditionResource, LitActionResource, createSiweMessageWithRecaps, generateAuthSig } from "@lit-protocol/auth-helpers";
import { ethers } from 'ethers';

const query = `What is the world like?`;
const key = process.env.HUGGING_FACE_API_KEY;;

const genActionSource = (query) => {
  return `(async () => {
      const apiKey = await Lit.Actions.decryptAndCombine({
          accessControlConditions,
          ciphertext,
          dataToEncryptHash,
          authSig: null,
          chain: 'ethereum',
      });
      const payload = {
        "inputs": "${query}",
    };
      const response = await fetch(
        "https://api-inference.huggingface.co/models/gpt2",
        {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + apiKey,
          },
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
    console.log(response);
    //const result = await response.json();
    const result = await response.text();
      Lit.Actions.setResponse({ response: result });
  })();`;
}

const ONE_WEEK_FROM_NOW = new Date(
  Date.now() + 1000 * 60 * 60 * 24 * 7
).toISOString();

const genProvider = () => {
  return new ethers.providers.JsonRpcProvider('https://lit-protocol.calderachain.xyz/replica-http');
}

const genWallet = () => {
  // known private key for testing
  // replace with your own key
  return new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', genProvider());
}

const genAuthSig = async (
  wallet,
  client,
  uri,
  resources
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
  wallet,
  client,
  resources) => {
  let sessionSigs = await client.getSessionSigs({
    chain: "ethereum",
    resourceAbilityRequests: resources,
    authNeededCallback: async (params) => {
      console.log("XXXXX resourceAbilityRequests:", params);

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
      const authSig = genAuthSig(wallet, client, params.uri, resources ?? []);
      return authSig;
    }
  });

  return sessionSigs;
}

const main = async () => {
  let client = new LitNodeClient({
    litNetwork: 'cayenne',
    /*
    storageProvider: {
      provider: new LocalStorage("./lit_storage.db"),
      },
      */
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
  /*
    const accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain,
        method: '',
        parameters: [
          ':userAddress',
        ],
        returnValueTest: {
          comparator: '=',
          value: '0x6Bd07000C5F746af69BEe7f151eb30285a6678B2'
        }
      }
    ]
  */

  await client.connect();
  /*
  Here we are encypting our key for secure use within an action
  this code should be run once and the ciphertext and dataToEncryptHash stored for later sending
  to the Lit Action in 'jsParams'
  */
  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      accessControlConditions,
      sessionSigs: {}, // your session
      chain,
      dataToEncrypt: key,
    },
    client
  );

  console.log("cipher text:", ciphertext, "hash:", dataToEncryptHash);

  const accsResourceString =
    await LitAccessControlConditionResource.generateResourceString(accessControlConditions, dataToEncryptHash);
  console.log("XXXXX:", accsResourceString);

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
  console.log("action source code: ", genActionSource(query));
  /*
  Here we use the encrypted key by sending the
  ciphertext and dataTiEncryptHash to the action
  */
  const res = await client.executeJs({
    sessionSigs: sessionForDecryption,
    code: genActionSource(query),
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
