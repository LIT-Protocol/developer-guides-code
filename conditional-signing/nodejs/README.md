# Conditional Signing Using the Lit SDK with Node.js

This code example demonstrates how to execute a Lit Action that only provides a Lit network signature (using a PKP) if a provided Ethereum address (provided via a [SIWE](https://eips.ethereum.org/EIPS/eip-4361) message) holds 1 or more Wei on Ethereum mainnet.

## Running this Example

### Install the Dependencies

In this directory, `conditional-signing/nodejs`, run `yarn` to install the project dependencies.

### Setting Up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` there are to ENVs

1. `ETHEREUM_PRIVATE_KEY` - **Required** Will be used to generate an Ethers.js wallet to perform the signing of transactions
2. `LIT_PKP_PUBLIC_KEY` - **Optional**
   - If provided, this PKP will be used to sign the message in the Lit Action if the conditional passes
   - If not provided, a new PKP will be minted and used to run this example
     - **NOTE** In order for a new Lit PKP to minted for you, you **must** have `tstLPX` tokens. You can receive some `tstLPX` using the faucet available [here](https://chronicle-yellowstone-faucet.getlit.dev/).
3. `LIT_CAPACITY_CREDIT_TOKEN_ID` - **Optional**
   - If provided, this [CapacityCredit](https://developer.litprotocol.com/paying-for-lit/capacity-credits) will be used to create an AuthSig to pay for usage the Lit network
   - If not provided, a new CapacityCredit will be minted and used to run this example. Please make sure that your wallet has enough `tstLPX` to pay for execution of the Lit Action

Your `.env` file should look like:

```
ETHEREUM_PRIVATE_KEY=0xYourPrivateKey
LIT_PKP_PUBLIC_KEY=yourPublicKey
LIT_CAPACITY_CREDIT_TOKEN_ID=yourCapacityCreditTokenId
CHAIN_TO_CHECK_CONDITION_ON=ethereum
```

Remember, leave `LIT_PKP_PUBLIC_KEY` empty if you want a new PKP to be minted for you, and if you leave `LIT_CAPACITY_CREDIT_TOKEN_ID` empty, a new CapacityCredit will be minted for you.

**NOTE** By changing the `CHAIN_TO_CHECK_CONDITION_ON` value, you can change the chain that the Lit Action will check the condition on. The current `.example.env` file sets this value to `ethereum`.

### Starting the Example

In this directory, `conditional-signing/nodejs`, run `yarn test` to execute the example. A series of events will occur after starting the script:

1. The Lit Node Client will connect to the Lit network
2. Your provided private key will be used to sign a SIWE message to authenticate with the Lit network
3. Your provided private key will be used to sign another SIWE message. This message is is what the Lit Action will derive an address from to use for the conditional check of whether or not to sign a message with your PKP. The Lit Action will **only** sign a message with your PKP if the derived address as 1 or more Wei on Ethereum Mainnet
4. Next, depending on whether or not you specified a PKP Public Key in the `.env` file:
   - If you did, you'll be on the next step
   - If you didn't, your provided private key will be used to sign a transaction to mint a new PKP on the Lit Chronicle Yellowstone rollup. This transaction will cost `tstLPX` (which is only a testnet token with **no** real-world value). Your PKP will be `console.log`ed, you can search the console output for: `✅ PKP successfully minted` and you should see something similar to:
   ```
    ℹ️  PKP token ID: 0x0ef9cdbcae80b86092c4dd874ee2718ffbbbddef662d437efc36c66ad5db45d3
    ℹ️  PKP public key: 04240f3dac4fb3431c0df0839581ee45dbb1be1d92d4d74355857f9953c104f36df6725e70897f9fe97f66f783d9e0a7287ba4f8fd023bffca701037331e17ccf6
    ℹ️  PKP ETH address: 0xa6DF77506934c49211787C643f345Ea7B68a9773
   ```
5. Next, depending on whether or not you specified a CapacityCredit Token ID in the `.env` file:
   - If you did, you'll be on the next step
   - If you didn't, your provided private key will be used to sign a transaction to mint a new CapacityCredit on the Lit Chronicle Yellowstone rollup. Again, this transaction will cost `tstLPX`. Your CapacityCredit token ID will be `console.log`ed, you can search the console output for: `✅ CapacityCredit successfully minted` and you should see something similar to:
   ```
   ✅ Minted new Capacity Credit with ID: 2888
   ```
   This CapacityCredit token ID will be used to create an AuthSig to pay for usage of the Lit network, specificied in the `capabilityAuthSig` field when generating session signatures.
6. Finally, a request to the Lit network will be used to execute the Lit Action. If the Ethereum address derived from your provided private key has a balance equal to or greater than 1 Wei on your specified chain, you should either see the signature in the console or a response in the console notifying you that the address does not have 1 or more Wei on the specified chain.
