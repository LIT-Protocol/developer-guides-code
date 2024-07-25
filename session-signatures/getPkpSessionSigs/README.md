# `getPkpSessionSigs` Code Example

This code demonstrates how to use the `getPkpSessionSigs()` method from the Lit SDK.

## Understanding the Implementation
1. Using an imported Ethereum private key, connect the wallet to the Lit RPC endpoint `Chronicle Yellowstone`
2. Connect to the Lit network using the LitNodeClient on the `datil-dev` network, specifying the local storage to hold the generated wallet and session keys
3. Initialize a secure connection to the Lit Relayer using the `LitAuthClient` and a `LIT_RELAYER_API_KEY`
4. Generate a wallet signature to use as an [`AuthMethod`](https://v6-api-doc-lit-js-sdk.vercel.app/interfaces/types_src.AuthMethod.html)
5. Use the `AuthMethod` to mint a PKP through the `LitAuthClient`
6. Get the session signatures for the newly minted PKP

**NOTE**
---

When using `getPkpSessionSigs()`, you have multiple authentication options. You can use `AuthSigs`, `AuthMethods`, or `Lit Actions`, and you're not strictly limited to using an `AuthMethod`.

---

## Running the Examples

### Install the Dependencies

In this directory, `session-signatures/getPkpSessionSigs`, run `yarn` to install the project dependencies.

### Setting up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` there is the ENV:

1. `ETHEREUM_PRIVATE_KEY` - **Required**
    - Ethereum private key of the address used to generate a wallet signature as an `AuthMethod`
2. `LIT_RELAYER_API_KEY` - **Required**
    - API key requied to use the relay server run by Lit. If you need one, they can be requested [here](https://docs.google.com/forms/d/e/1FAIpQLSeVraHsp1evK_9j-8LpUBiEJWFn4G5VKjOWBmHFjxFRJZJdrg/viewform)

### Running the Test

After the `.env` is configured, there is a NPM script in the `package.json` to run the test in the `test/index.spec.ts` file. To run the test, use the `yarn test` command.
