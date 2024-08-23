# Paying for Lit Code Examples

This code demonstrates how to:

1. Mint a Capacity Credit using the `@lit-protocol/contracts-sdk` package
2. Generate a Capacity Delegation Auth Sig to delegate usage of a Capacity Credit
3. Generate Session Signatures with a Capacity Delegation Auth Sig to make request to the Lit network that require payment

## Running the Examples

### Install the Dependencies

In this directory, `paying-for-lit/`, run `yarn` to install the project dependencies.

### Setting up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` there is the ENV:

1. `ETHEREUM_PRIVATE_KEY` - **Required**
   - Must have Lit `tstLPX` tokens on the `Chronicle Yellowstone` blockchain
     - [Faucet for Chronicle Yellowstone](https://chronicle-yellowstone-faucet.getlit.dev/)
   - Will be used to mint the a Capacity Credit and delegate it's usage

### Running the Test

After the `.env` is configured, run the test using the `yarn test` command.
