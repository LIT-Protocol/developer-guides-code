<<<<<<< HEAD
# `decryptAndCombine` Lit Action Code Example

This code demonstrates how to use the Lit and Lit Actions SDKs to implement the `decryptAndCombine` method in a Lit Action. This method collects and combines the decryption shares from each of the Lit nodes onto a single Lit node, where the given content is decrypted. In this example, that means the API key remains in [Lit's Trusted Execution Environment (TEE)](https://developer.litprotocol.com/resources/how-it-works#sealed-and-confidential-hardware) and is not exposed to the client.

## Understanding the Implementation

1. Using an imported Ethereum private key, connect the wallet to the Lit RPC endpoint `Chronicle Yellowstone`
2. Connect to the Lit network using the `LitNodeClient` on the `datil-test` network
3. Connect the `LitContracts` client to the Lit network (`datil-test` in this case)
4. **If not provided in the .env file**: Mint a [`capacityCreditsNFT`](https://developer.litprotocol.com/sdk/capacity-credits) and define the request limit and expiration date
5. Define the Access Control Conditions (ACCs) required to decrypt the data, and encrypt the API key using the `encryptString` function
6. Generate an ACCs resource string. This will be used when we generate session signatures to specify that our current session is permitted to only decrypt the encrypted data we have created
7. Use the `executeJs` method to execute the Lit Action code. This step also involves generating the session signatures, specifying decryption and Lit Action execution as abilities for our session

## **NOTE**

Running the test in this repository will make an HTTP request to the Base Mainnet, querying the current blocknumber. If you'd like to use a different blockchain, change the URL in the Lit Action file and run the test again.

---

## Running the Examples

### Install the Dependencies

In this directory, `decrypt-api-key-in-action/nodejs`, run `yarn` to install the project dependencies.

### Setting up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` file there are the following ENVs:

1. `ETHEREUM_PRIVATE_KEY` - **Required**
   - Must have Lit `tstLPX` tokens on the `Chronicle Yellowstone` blockchain
     - [Faucet for Chronicle Yellowstone](https://chronicle-yellowstone-faucet.getlit.dev/)
   - Will be used to pay for Lit usage
2. `ALCHEMY_API_KEY` - **Required**
   - The Alchemy API key that will be encrypted and later decrypted in the Lit Action. Afterwards, it will be used to make an HTTP request to the Base Mainnet blockchain. If you need an Alchemy API key, you can make an account on [their website](https://www.alchemy.com/)
3. `LIT_CAPACITY_CREDIT_TOKEN_ID` - **Optional**
   - If not provided, a new `capacityCreditsNFT` will be minted and used. This enables the `ETHEREUM_PRIVATE_KEY` to pay for Lit usage

### Running the Test

After the `.env` is configured, there is a NPM script in the `package.json` to run the test in the `test/decryptApiKeyInActionTest.spec.ts` file. To run the test, use the `yarn test` command.
=======
# Decrypt and Use an API Key Within a Lit Action

This example shows how you can encrypt an api key on the client with specific decrypt conditions, and then decrypt that api key from within a Lit Action to perform some remote api call with the key.

Before running, there are two variables to configure within `index.ts`:

**Note: ts-node-esm requires NodeJS version 20**

```js
const url = `<your http endpoint for api-key usage>`;
const key = "<your api key>";
```

## Restricting your api key to only be used by a single Lit Action

Within the code you will see the below ACC condition:

```js
const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain,
    method: "eth_getBalance",
    parameters: [":userAddress", "latest"],
    returnValueTest: {
      comparator: ">=",
      value: "0",
    },
  },
];
```

You can change the above to the below to use the parameter: `:currentActionId` which will only allow a speific `IPFS ID` to decrypt the key which is explicitly asserted on in the condition `parameters`

```js
const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain,
    method: "eth_getBalance",
    parameters: [":currentActionId", "latest"],
    returnValueTest: {
      comparator: "==",
      value: "<your ipfs id>",
    },
  },
];
```

For easy upload of your Lit Action source code you can use the explorer [here](https://explorer.litprotocol.com/create-action)
>>>>>>> 314a19b (refactor: changed dir structure for decrypt-api-key-in-action as per templates)
