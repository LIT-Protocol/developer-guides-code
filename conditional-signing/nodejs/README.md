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

1. `PRIVATE_KEY` - **Required** Will be used to generate an Ethers.js wallet to perform the signing of transactions
2. `PKP_PUBLIC_KEY` - **Optional**
   - If provided, this PKP will be used to sign the message in the Lit Action if the conditional passes
   - If not provided, a new PKP will be minted and used to run this example
     - **NOTE** In order for a new Lit PKP to minted for you, you **must** have `testLPX` tokens. You can receive some `testLPX` using the faucet available [here](https://faucet.litprotocol.com/).

Your `.env` file should look like:

```
PRIVATE_KEY=0xYourPrivateKey
PKP_PUBLIC_KEY=yourPublicKey
```

Remember, leave `PKP_PUBLIC_KEY` empty if you want a new PKP to be minted for you.

### Starting the Example

In this directory, `conditional-signing/nodejs`, run `yarn start` to execute the example. A series of events will occur after starting the script:

1. The Lit Node Client will connect to the Lit network
2. Your provided private key will be used to sign a SIWE message to authenticate with the Lit network
3. Your provided private key will be used to sign another SIWE message. This message is is what the Lit Action will derive an address from to use for the conditional check of whether or not to sign a message with your PKP. The Lit Action will **only** sign a message with your PKP if the derived address as 1 or more Wei on Ethereum Mainnet
4. Next, depending on whether or not you specified a PKP Public Key in the `.env` file:
   a. If you did, you'll be on the next step
   b. If you didn't, your provided private key will be used to sign a transaction to mint a new PKP on the Lit Chronicle rollup. This transaction will cost `testLPX` (which is only a testnet token with **no** real-world value). Your PKP will be `console.log`ed, you can search the console output for: `Minted PKP!` and you should see something similar to:
   ```json
   {
     "tokenId": "0x8b141c700d43ada89a851aa75d5d7ec2d24fbb8e5f371d6fe51226e23889971b",
     "publicKey": "0467aeba1a5bfb5cc304f5d813af45e8012d422a82d077b63eb99b4695a3d52baba9f2e45c2514aecb08bb25c1486c2e27b663eb1f5fb4d8f9579c4de7b1b4df5a",
     "ethAddress": "0xd85eAFeBcc726730B0ab01083c06d5D5F27F7FE7"
   }
   ```
5. Finally, a request to the Lit network will be used to execute the Lit Action. If the Ethereum address derived from your provided private key has a balance equal to or greater than 1 Wei on Ethereum Mainnet, you should see in the console something similar to:
   ```json
   litActionSignatures
   {
    claims: {},
    signatures: {
      sig: {
        r: '3a71f3a020ca8557bc1ec157f826561c282585eb447035626ee4059531083ce8',
        s: '02be0bf088da8ee1dc4de06b6d9f9c399b578f19f90b574875e9ad9727100edb',
        recid: 1,
        signature: '0x3a71f3a020ca8557bc1ec157f826561c282585eb447035626ee4059531083ce802be0bf088da8ee1dc4de06b6d9f9c399b578f19f90b574875e9ad9727100edb1c',
        publicKey: '041E7A220A697F47491525798337BFAAC6073C6094FDDE9187D749D28D947F59FE73FBAE024FC0B87D2A61068EA8087E94ECC843820752295307537F9D06432876',
        dataSigned: '7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4'
      }
    },
    response: undefined,
    logs: ''
   }
   ```
   If the address does not have 1 or more Wei, you should see an empty signature:
   ```json
   litActionSignatures
   {
    success: true,
    signedData: {},
    decryptedData: {},
    claimData: {},
    response: undefined,
    logs: undefined
   }
   ```
