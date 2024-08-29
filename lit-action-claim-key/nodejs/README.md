# Claim a Deterministically Derived PKP Using a User ID

This code demonstrates how to use a custom user ID to deterministically generate a PKP.

You can read more about claimable keys [here](https://developer.litprotocol.com/user-wallets/pkps/claimable-keys/intro), and how to claim keys using a Lit Action [here](https://developer.litprotocol.com/sdk/serverless-signing/key-claiming).

## Running the Example

### Install the Dependencies

In this directory, `lit-action-claim-key/nodejs`, run `yarn` to install the project dependencies.

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

### Running the Tests

After the `.env` is configured, the `test` NPM script in the `package.json` will run a test that executes the example script. Run it using:

```
yarn test
```
