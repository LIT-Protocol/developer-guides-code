# Implementing Fetch Within a Lit Action with Node.js

This code example demonstrates a Lit Action that fetches data from an API and conditionally signs a message based on the retrieved information.

## Understanding the Implementation

1. Using an imported Ethereum private key, connect the wallet to the Lit RPC endpoint `Chronicle Yellowstone`
2. Connect to the Lit network using the `LitNodeClient` on the `datil-test` network
3. Connect the `LitContracts` client to the Lit network (`datil-test` in this case)
4. **If not provided in the .env file**: Mint a [`PKP`](https://developer.litprotocol.com/user-wallets/pkps/overview)
5. **If not provided in the .env file**: Mint a [`capacityCreditsNFT`](https://developer.litprotocol.com/sdk/capacity-credits) and define the request limit and expiration date. This will be used to create a `capacityDelegationAuthSig` to pay for Lit usage
6. The Lit Action will be executed. The console will then show the Lit Action response and whether the signature was successful

## Running this Example

### Install the Dependencies

In this directory, `lit-action-using-fetch/nodejs`, run `yarn` to install the project dependencies.

### Specifying Your Lit PKP's Public Key and CapacityCredit Token ID

If you already have a Lit PKP that you'd like to use, you can copy the contents of the provided `.env.example` to a `.env` file to specify it. If you don't have a PKP, or wish to use a new one for this example, then you can skip this step and one will be created for you when you run this example. This is also the case for the Lit Capacity Credit Token ID; you can provide one or have one minted for you.

**NOTE** In order for a new Lit PKP to be minted for you, you **must** have `tstLPX` tokens. You can receive some `tstLPX` using the faucet available [here](https://chronicle-yellowstone-faucet.getlit.dev/).

```
cp .env.example .env
```

Within the `.env` file there are three ENVs

1. `ETHEREUM_PRIVATE_KEY` - **Required** Will be used to generate an Ethers.js wallet to perform the signing of transactions
2. `LIT_PKP_PUBLIC_KEY` - **Optional**
   - If provided, this PKP will be used to sign the message in the Lit Action
   - If not provided, a new PKP will be minted and used to run this example
     - **NOTE** In order for a new Lit PKP to minted for you, you **must** have `tstLPX` tokens. You can receive some `tstLPX` using the faucet available [here](https://chronicle-yellowstone-faucet.getlit.dev/).
3. `LIT_CAPACITY_CREDIT_TOKEN_ID` - **Optional**
   - If provided, this [CapacityCredit](https://developer.litprotocol.com/paying-for-lit/capacity-credits) will be used to create an AuthSig to pay for usage the Lit network
   - If not provided, a new CapacityCredit will be minted and used to run this example. Please make sure that your wallet has enough `tstLPX` to pay for execution of the Lit Action

### Running the Test

After the `.env` is configured, there is a NPM script in the `package.json` to run the test in the `test/index.spec.ts` file. To run the test, use the `yarn test` command.