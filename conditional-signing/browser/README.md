# Conditional Signing Using the Lit SDK in the Browser

This code example demonstrates how to execute a Lit Action that only provides a Lit network signature (using a PKP) if a provided Ethereum address (provided via a [SIWE](https://eips.ethereum.org/EIPS/eip-4361) message) holds 1 or more Wei on Ethereum mainnet.

## Running this Example

### Install the Dependencies

In this directory, `conditional-signing/browser`, run `yarn` to install the project dependencies.

### Specifying Your Lit PKP's Public Key and CapacityCredit Token ID

If you already have a Lit PKP that you'd like to use, you can copy the contents of the provided `.env.example` to a `.env` file to specify it. If you don't have a PKP, or wish to use a new one for this example, then you can skip this step and one will be created for you when you run this example. This is also the case for the Lit Capacity Credit Token ID; You can provide one or have one minted for you.

**NOTE** In order for a new Lit PKP to minted for you, you **must** have `tstLPX` tokens. You can receive some `tstLPX` using the faucet available [here](https://chronicle-yellowstone-faucet.getlit.dev/).

```
cp .env.example .env
```

Your `.env` file should look like:

```
VITE_LIT_PKP_PUBLIC_KEY=yourPublicKey
VITE_LIT_CAPACITY_CREDIT_TOKEN_ID=yourCapacityCreditTokenId
VITE_CHAIN_TO_CHECK_CONDITION_ON=ethereum
```

**NOTE** By changing the `VITE_CHAIN_TO_CHECK_CONDITION_ON` value, you can change the chain that the Lit Action will check the condition on. The current `.example.env` file sets this value to `ethereum`.

### Starting the Example

In this directory, `conditional-signing/browser`, run `yarn dev` to bundle all of this code and server the HTML file at: [http://localhost:5173](http://localhost:5173).

After starting and waiting for Vite to serve the website, you should see a page with a single button that says: `Run the Lit Action`.

Before you click the button, open up the JavaScript console in your browser so you can see the output of this example.

After clicking the button a couple things will happen:

1. You will be prompted by your wallet (i.e. MetaMask) to connect an account to the site
2. After connecting an account, you will see the following output in the browser console:
   ```
   Clicked
   Connected account: 0xA89543a7145C68E52a4D584f1ceb123605131211
   🔄 Connecting to the Lit network...
   ✅ Connected to the Lit network
   ```
3. You will then be prompted by your wallet to sign a message, this message will be used to authenticate you with the Lit network
4. After signing that message, you will be prompted by your wallet to sign another message. This message is the SIWE message the Lit Action will derive an address from to use for the conditional check of whether or not to sign a message with your PKP. The Lit Action will **only** sign a message with your PKP if the derived address has 1 or more Wei on Ethereum Mainnet
5. After signing that message, depending on whether or not you specified a PKP Public Key in the `.env` file:
   - If you did, you'll be on the next step
   - If you didn't, you will be prompted by your wallet to sign a transaction to mint a new PKP on the Lit Chronicle Yellowstone rollup. This transaction will cost `tstLPX` (which is only a testnet token with **no** real-world value). After signing this transaction you should see in the browser console something similar to:
   ```
    ℹ️  PKP token ID: 0x0ef9cdbcae80b86092c4dd874ee2718ffbbbddef662d437efc36c66ad5db45d3
    ℹ️  PKP public key: 04240f3dac4fb3431c0df0839581ee45dbb1be1d92d4d74355857f9953c104f36df6725e70897f9fe97f66f783d9e0a7287ba4f8fd023bffca701037331e17ccf6
    ℹ️  PKP ETH address: 0xa6DF77506934c49211787C643f345Ea7B68a9773
   ```
6. Next, depending on whether or not you specified a CapacityCredit Token ID in the `.env` file:
   - If you did, you'll be on the next step
   -  If you didn't, you will be prompted by your wallet to sign a transaction to mint a new CapacityCredit on the Lit Chronicle Yellowstone rollup. Agin, this transaction will cost `tstLPX`. After signing this transaction you should see in the browser console something similar to:
   ```
   ✅ Minted new Capacity Credit with ID: 2888
   ```
6. Finally, if the Ethereum address you signed the SIWE message with has a balance equal to or greater than 1 Wei on Ethereum Mainnet, you should see in the JavaScript console something similar to:
   ```json
   litActionSignatures:
   {
     "claims": {},
     "signatures": {
       "sig": {
         "r": "b276fc11cbb133eeb25e0d5ff5c759514cfb21f15d0248cdfafc0440fa148d2a",
         "s": "006e3b9ece94f8531b5baa4b428a8c6155335e61a5639980d20c9d7477f6746f",
         "recid": 1,
         "signature": "0xb276fc11cbb133eeb25e0d5ff5c759514cfb21f15d0248cdfafc0440fa148d2a006e3b9ece94f8531b5baa4b428a8c6155335e61a5639980d20c9d7477f6746f1c",
         "publicKey": "041E7A220A697F47491525798337BFAAC6073C6094FDDE9187D749D28D947F59FE73FBAE024FC0B87D2A61068EA8087E94ECC843820752295307537F9D06432876",
         "dataSigned": "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"
       }
     },
     "logs": ""
   }
   ```
   If the address does not have 1 or more Wei, you should see an empty signature with the custom error response set within the Lit Action:
   ```json
   litActionSignatures:
   {
     "success": true,
     "signedData": {},
     "decryptedData": {},
     "claimData": {},
     "response": "address does not have 1 or more Wei on ethereum"
   }
   ```
