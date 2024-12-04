# OpenAI + PKP Example within a Lit Action

This code example demonstrates how an OpenAI API key can be used to generate a response, which is then signed by a Lit PKP—all within the confines of Lit's Trusted Execution Environment (TEE).

## Prerequisites

- **An Ethereum private key**
  - This private key will be used to:
    - Own the PKP we mint.
    - In order to pay for this, the corresponding Ethereum account must have Lit Test Tokens. If you do not have any, you can get some from [the faucet](https://chronicle-yellowstone-faucet.getlit.dev/).
- **An OpenAI API key**
    - We will use this to make a request to OpenAI with our query to generate a response.
    - This example currently uses the `gpt-4o-mini` model, please enable this model on your API key or change it in the code if needed.
- **Node.js and Yarn**
    - Please have these installed before running the example.

## Installation and Setup

1. Clone the repository
2. `cd` into the code example directory: `cd pkp-sign-openai/nodejs`
3. Install the dependencies: `yarn`
4. Create and fill in the `.env` file: `cp .env.example .env`
    -  **Required**:
        - `ETHEREUM_PRIVATE_KEY`: This is the Ethereum private key that will be used to mint a PKP
        - `OPENAI_API_KEY`: This is the OpenAI API key that will be used to make a request within our Lit Action

## Executing the Example

Executing the example can be done with running `yarn test`.

Here's an overview of how the code example works:

1. Using an imported Ethereum private key, connect the wallet to the Lit RPC endpoint `Chronicle Yellowstone`
2. Connect to the Lit network using the `LitNodeClient` on the `datil-dev` network
3. Connect the `LitContracts` client to the Lit network (`datil-dev` in this case)
4. Mint a new PKP.
5. Use your Ethereum wallet to create an AuthMethod.
6. Use the created AuthMethod for authentication in generating session signatures for our PKP.
7. Run the Lit Action.

### Lit Action Overview

Within the Lit Action:

1. Send the prompt to OpenAI and receive a response.
2. Use the PKP to sign the OpenAI response.

### Expected Output

After running the test, the end of the output in the console should appear similar to:

```ts
✅ Executed the Lit Action
{
  claims: {},
  signatures: {
    OpenAI: {
      r: 'e0b353e4ed252982a2c9349a5a00beb3be4ef2e4cd638e233d6d36e82a2f96d1',
      s: '57ea34e2839c51f8a262ecc4e62bd40f6df373491ea618b5ccf5a62ab7d06050',
      recid: 0,
      signature: '0xe0b353e4ed252982a2c9349a5a00beb3be4ef2e4cd638e233d6d36e82a2f96d157ea34e2839c51f8a262ecc4e62bd40f6df373491ea618b5ccf5a62ab7d060501b',
      publicKey: '04CF6CC2EFD14F3EBE92160D972D22E281D87201DE39276B2514F104F79932D3B98C4C3C7B52A36DE8871B653386530F7CAAD4A022E1A41D59FBF416FD55A2D7DD',
      dataSigned: 'EFC84F5BD0C2AE1CF264F52F0ADBDADA9093FFFF9F8A6150E7EDCA0C1D558EB2'
    }
  },
  response: true,
  logs: ''
}
```

## Specific Files to Reference

- [./src/index.ts](./src/index.ts): Contains the core logic for the example
- [./src/litAction.ts](./src/litAction.ts): Contains the Lit Action code
