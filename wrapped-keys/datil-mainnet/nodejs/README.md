# Send a Wrapped Key Transaction on Datil Mainnet

This code demonstrates:

1. Minting a new PKP
2. Minting a new Capacity Credit
3. Delegating use of the Capacity Credit to the PKP
4. Getting PKP Session Signatures
5. Generating a new EVM Wrapped Key
6. Signing and sending a EVM transaction using the Wrapped Key

## Running the Example

### Install the Dependencies

In this directory, `wrapped-keys/datil-mainnet/nodejs`, run `yarn` to install the project dependencies.

### Setting Up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` there are the ENVs:

1. `ETHEREUM_PRIVATE_KEY` - **Required**
   - Must have Lit test tokens on the Chronicle Yellowstone blockchain
     - [Faucet for Chronicle Yellowstone](https://chronicle-yellowstone-faucet.getlit.dev/)
   - Will be used to:
     - Mint PKP
     - Mint Capacity Credit
     - Pay for usage of Lit network
     - Fund the generate Wrapped Key ETH address

### Running the Tests

After the `.env` is configured, the `test` NPM script in the `package.json` will run a test that executes the example script. Run it using:

```
yarn test
```
