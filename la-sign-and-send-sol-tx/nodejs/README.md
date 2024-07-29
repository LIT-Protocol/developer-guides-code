# Lit Action Solana Tx Confirmation Timeout

## Running the Examples

### Install the Dependencies

In this directory, `la-sign-and-send-sol-tx/nodejs`, run `yarn` to install the project dependencies.

### Setting Up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` there are the ENVs:

1. `ETHEREUM_PRIVATE_KEY` - **Required**
   - Must have Lit test tokens on the Chronicle Yellowstone blockchain
     - [Faucet for Chronicle Yellowstone](https://chronicle-yellowstone-faucet.getlit.dev/)
   - Will be used to pay for Lit usage
2. `SOLANA_PRIVATE_KEY` - **Required**
   - Must have SOL on the Solana Devnet
     - [Faucet for Solana Devnet](https://faucet.solana.com/)
   - Will be used to send `0.01` SOL tx

### Run the Test

After filling out the `.env` file, run `yarn test` to run the test
