# Solana + OpenAI Example within a Lit Action

This code example demonstrates how an OpenAI API key can be used to generate a response, which is then signed by a Lit Solana Wrapped Key—all within the confines of Lit's Trusted Execution Environment (TEE).

## Prerequisites

- **An Ethereum private key**
  - This private key will be used to:
    - Own the PKP we mint. The minted PKP will be used to create new Wrapped Keys.
    - In order to pay for this, the corresponding Ethereum account must have Lit Test Tokens. If you do not have any, you can get some from [the faucet](https://chronicle-yellowstone-faucet.getlit.dev/).
- **An OpenAI API key**
    - We will use this to make a request to OpenAI with our query to generate a response.
    - This example currently uses the GPT-4o-mini model, please enable this model on your API key or change it in the code if needed.
- **Node.js and Yarn**
    - Please have these installed before running the example.

## Installation and Setup

1. Clone the repository
2. `cd` into the code example directory: `cd solana-openai/nodejs`
3. Install the dependencies: `yarn`
4. Create and fill in the `.env` file: `cp .env.example .env`
    -  **Required**:
        - `ETHEREUM_PRIVATE_KEY`: This is the Ethereum private key that will be used to mint a PKP if one is not provided
        - `OPENAI_API_KEY`: This is the OpenAI API key that will be used to make a request within our Lit Action
    - **Optional**:
    - `LIT_PKP_PUBLIC_KEY`: You can also provide your own PKP for this example, but please make sure the PKP is owned by the provided Ethereum wallet
5. Test the example: `yarn test`

## Executing the Example

Executing the example can be done with running `yarn test`. This script will bundle our Lit Action with the necessary modules and run our [test file](./test/decryptApiKeyInActionTest.spec.ts).

Here's an overview of how the code example works:

1. Using an imported Ethereum private key, connect the wallet to the Lit RPC endpoint `Chronicle Yellowstone`
2. Connect to the Lit network using the `LitNodeClient` on the `datil-dev` network
3. Connect the `LitContracts` client to the Lit network (`datil-dev` in this case)
4. **If a PKP is not provided in the .env file**: Mint a new PKP.
5. Use your Ethereum wallet to create an AuthMethod.
6. Use the created AuthMethod for authentication in generating session signatures for our PKP.
7. Generate a new Solana Wrapped Key.
8. Retrieve the encrypted private key of our Wrapped Key.
9. Set up Access Control Conditions (ACCs) to encrypt our OpenAI API key. This ensures it is not revealed at any point. The ACCs are the same ones that were used to encrypt the Wrapped Key.
10. Write a simple prompt for the AI to answer.
11. Run the Lit Action, providing our encrypted Solana Wrapped Key and OpenAI API key metadata, as well as our prompt.

### Lit Action Overview

Within the Lit Action:

1. Decrypt the Solana Wrapped Key and OpenAI API key.
2. Remove the salt from the decrypted Solana private key.
3. Send the prompt to OpenAI and receive a response.
4. Generate a Solana keypair from the decrypted private key.
5. Use the Solana keypair to sign the OpenAI response.
6. Ensure the signature is valid.

### Expected Output

After running the test, the end of the output in the console should appear similar to:

```ts
✅ Executed the Lit Action
{
  success: true,
  signedData: {},
  decryptedData: {},
  claimData: {},
  response: 'Signed message. Is signature valid: true',
  logs: 'OpenAI Response: Consider conducting thorough research and assessing market trends before making your decision on DogeCoin.\n' +
    'Solana Signature: Uint8Array(64) [\n' +
    '  169, 139,  64,  61,  97, 115, 213, 176, 232, 227, 185,\n' +
    '  208, 231, 224, 254, 129, 141, 144,  51, 240,   0,  85,\n' +
    '   60, 104, 205,  68,  58,  92, 171,  46, 147, 148,  56,\n' +
    '  219,  95, 164,  23, 248,  73,  40, 176, 185,  12, 142,\n' +
    '    5,  71, 131, 184,  90, 235,  30, 140,   4,  29, 233,\n' +
    '   63, 238, 142, 143,  14,  98,  51,  23,   8\n' +
    ']\n'
}
```

## Specific Files to Reference

- [./src/index.ts](./src/index.ts): Contains the core logic for the example
- [./src/litAction.js](./src/litAction.js): Contains the Lit Action code that will be bundled
- [./src/litAction.bundle.js](./src/litAction.bundle.js): Contains the bundled Lit Action code
- [./src/utils.ts](./src/utils.ts): Contains the code for minting a new PKP and ensuring the required environment variables are set
