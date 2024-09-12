# Conditional Signing Using the Lit SDK in the Browser

This code example demonstrates how to execute a Lit Action that only provides a Lit network signature (using a PKP) if a provided Ethereum address (provided via a [SIWE](https://eips.ethereum.org/EIPS/eip-4361) message) holds 1 or more Wei on Ethereum mainnet.

## Running this Example

### Install the Dependencies

In this directory, `conditional-signing/browser`, run `yarn` to install the project dependencies.

### Specifying Your Lit PKP's Public Key

If you already have a Lit PKP that you'd like to use, you can copy the contents of the provided `.env.example` to a `.env` file to specify it. If you don't have a PKP, or wish to use a new one for this example, then you can skip this step and one will be created for you when you run this example.

**NOTE** In order for a new Lit PKP to minted for you, you **must** have `tstLPX` tokens. You can receive some `tstLPX` using the faucet available [here](https://faucet.litprotocol.com/).

```
cp .env.example .env
```

Your `.env` file should look like:

```
PKP_PUBLIC_KEY=yourPublicKey
```

### Starting the Example

In this directory, `conditional-signing/browser`, run `yarn start` to bundle all of this code and server the HTML file at: [http://localhost:1234](http://localhost:1234).

After starting and waiting for Parcel to serve the website, you should see a page with a single button that says: `Click Me`.

Before you click the button, open up the JavaScript console in your browser so you can see the output of this example.

After clicking the button a couple things will happen:

1. You will be prompted by your wallet (i.e. MetaMask) to connect an account to the site
2. After connecting an account, you will see the following output in the JavaScript console:
   ```
   Clicked
   Connected account: 0xA89543a7145C68E52a4D584f1ceb123605131211
   Connecting litNodeClient to network...
   litNodeClient connected!
   Getting Session Signatures...
   ```
3. You will then be prompted by your wallet to sign a message, this message will be used to authenticate you with the Lit network
4. After signing that message, you will be prompted by your wallet to sign another message. This message is the SIWE message the Lit Action will derive an address from to use for the conditional check of whether or not to sign a message with your PKP. The Lit Action will **only** sign a message with your PKP if the derived address has 1 or more Wei on Ethereum Mainnet
   - After signing this message, you should see in the JavaScript console something similar to:
     ```json
     Got Auth Sig for Lit Action conditional check!
     {
        "sig": "0x6607f337861bf1f2ce331ee3a6ef7b5c08e31fb124e2139c48c6f0223258727306a1b38dbd9fa696f6ecc8a9dca82cca61e23882c0787bbf07dc0ba7bbb1ef081c",
        "derivedVia": "web3.eth.personal.sign",
        "signedMessage": "localhost wants you to sign in with your Ethereum account:\n0xA89543a7145C68E52a4D584f1ceb123605131211\n\nThis is a test statement.  You can put anything you want here.\n\nURI: http://localhost\nVersion: 1\nChain ID: 1\nNonce: 0x40e2d121e4513c45063212f65f139b300625a91e3900a76f56478ffd815bef21\nIssued At: 2024-05-03T23:43:48.500Z\nExpiration Time: 2024-05-04T23:43:45.894Z",
        "address": "0xA89543a7145C68E52a4D584f1ceb123605131211"
     }
     ```
5. After signing that message, depending on whether or not you specified a PKP Public Key in the `.env` file:
   a. If you did, you'll be on the next step
   b. If you didn't, you will be prompted by your wallet to sign a transaction to mint a new PKP on the Lit Chronicle rollup. This transaction will cost `testLPX` (which is only a testnet token with **no** real-world value). After signing this transaction you should see in the JavaScript console something similar to:
   ```json
    Minted PKP!
    {
        "tokenId": "0x59cb949a00d46ccd9deceb9912f935871deea7711951433254135242f53153fd",
        "publicKey": "0400f74bb0ece6c5c4f9577f358a77790a7b790eef48e3367bd05a3cc648504fb1efc99b840549809b85d66c5f55503f9ef92eeee5e3eb30ee06976d7b5fbc3c90",
        "ethAddress": "0x5c2e895EDAdce9fB019D497238013bF7527d6690"
    }
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
     "response": "address does not have 1 or more Wei on Ethereum Mainnet"
   }
   ```
