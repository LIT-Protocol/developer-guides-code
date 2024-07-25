# `getSessionSigs` Code Example

This code demonstrates how to use the `getSessionSigs()` method from the Lit SDK.

## Understanding the Implementation
1. Using an imported Ethereum private key, connect the wallet to the Lit RPC endpoint `Chronicle Yellowstone`
2. Connect to the Lit network using the LitNodeClient on the `datil-dev` network, specifying the local storage to hold the generated wallet and session keys
3. Generate the session signatures via an [`AuthSig`](https://v6-api-doc-lit-js-sdk.vercel.app/interfaces/types_src.AuthSig.html) (Authentication Signature)

## Running the Examples

### Install the Dependencies

In this directory, `session-signatures/getSessionSigs`, run `yarn` to install the project dependencies.

### Setting up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` there is the ENV:

1. `ETHEREUM_PRIVATE_KEY` - **Required**
    - Ethereum private key of the address used to sign the SIWE (Sign In with Ethereum) message within the `AuthSig`

### Running the Test

After the `.env` is configured, there is a NPM script in the `package.json` to run the test in the `test/index.spec.ts` file. To run the test, use the `yarn test` command.
