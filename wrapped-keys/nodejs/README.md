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

1. `ETHEREUM_PRIVATE_KEY` - **Required**
   - Must have Lit test tokens on the Chronicle Yellowstone blockchain
     - [Faucet for Chronicle Yellowstone](https://chronicle-yellowstone-faucet.getlit.dev/)
   - Will be used to mint PKPs and pay for Lit usage
2. `SOLANA_PRIVATE_KEY` - **Required**
   - Must have SOL on the Solana Devnet
     - [Faucet for Solana Devnet](https://faucet.solana.com/)
   - Will be used to fund Wrapped Key for signing and sending transaction test

### Running the Tests

After the `.env` is configured, there are several NPM scripts in the `package.json` to run individual test suites, or to run all the tests:

- `test` Runs all the tests
- `test:import` Runs only the `importPrivateKey` tests
- `test:export` Runs only the `exportPrivateKey` tests
- `test:generate` Runs only the `generatePrivateKey` tests
- `test:getKey` Runs only the `getEncryptedKey` tests
- `test:storeKey` Runs only the `storeEncryptedKey` tests
- `test:list` Runs only the `listEncryptedKeyMetadata` tests
- `test:sign:msg` Runs only the `signMessageWithEncryptedKey` tests
- `test:sign:tx` Runs only the `signTransactionWithEncryptedKey` tests
  - **NOTE** These test will attempt to transfer Lit test tokens on the Lit Chronicle Yellowstone blockchain, and Solana test token on the Solana Devnet
