# Wrapped Keys Code Examples

This code demonstrates how to use the Wrapped Keys SDK.

## Running the Examples

### Install the Dependencies

In this directory, `wrapped-keys/nodejs`, run `yarn` to install the project dependencies.

### Setting Up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` there are the ENVs:

1. `ETHEREUM_PRIVATE_KEY` - **Required** The corresponding Ethereum address needs to have Lit tokens on Chronicle as it will be used to mint PKPs. This key will also be used in all the tests for signing AuthSigs for PKP Session Sigs. Additionally, it will be imported as a Wrapped Key.
2. `SOLANA_PRIVATE_KEY` - **Required** Will be used for the `exportPrivateKey` tests.

### Running the Tests

After the `.env` is configured, there are several NPM scripts in the `package.json` to run individual test suites, or to run all the tests:

- `test` Runs all the tests
- `test:export` Runs only the `exportPrivateKey` tests
- `test:import` Runs only the `importPrivateKey` tests
- `test:generate` Runs only the `generatePrivateKey` tests
- `test:sign:tx` Runs only the `signTransactionWithEncryptedKey` tests
- `test:sign:msg` Runs only the `signMessageWithEncryptedKey` tests
