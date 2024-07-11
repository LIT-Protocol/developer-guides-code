# User Wallet Example

This code example:

1. Generates a new Ethereum private key
2. Uses the private key to generate a Lit Auth Method
3. Mints a new PKP using the Lit Relayer and adding the Lit Auth Method as a permitted Auth Method to sign anything
4. Gets the new PKP info
5. Generates Session Signatures using the PKP
6. Imports the Ethereum private key from step 1. as a Lit Wrapped Key
7. Funds the Ethereum address from step 1. on the Lit Vesuvius chain
8. Then signs and sends a transaction using the Wrapped Key

## Running this Example

### Setting Up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```bash
cp .env.example .env
```

Within the `.env` there are the ENVs:

`LIT_RELAYER_API_KEY` - **Required** The Lit API key to authorize use of the Lit Relayer. If you do not have one, one can be obtained using [this form](https://docs.google.com/forms/d/e/1FAIpQLSeVraHsp1evK_9j-8LpUBiEJWFn4G5VKjOWBmHFjxFRJZJdrg/viewform).
`ETHEREUM_PRIVATE_KEY` - **Required** The corresponding Ethereum address needs to have Lit tokens on the [Chronicle Vesuvius chain](https://developer.litprotocol.com/connecting-to-a-lit-network/lit-blockchains/chronicle-vesuvius) as it will be used to mint the new PKP, and fund the generated Ethereum address. If you do not have Lit test tokens, you can get some using [the faucet](https://datil-dev-faucet.vercel.app/).

### Running the Example

After setting up the `.env` file, you can run the code example using the NPM script: `start`:

```bash
yarn start
```

This should have console output similar to:

```bash
🔄 Generating a wallet for the user...
✅ Created the Ethereum wallet: 0xcD2e41b42451EA1243d237A536ab2b3464318c06
🔄 Connecting to Lit network...
✅ Connected to Lit network
🔄 Initializing a Lit Auth client...
[Lit-JS-SDK v6.1.0] [2024-07-11T03:27:13.307Z] [DEBUG] [auth-client] Lit's relay server URL: https://datil-dev-relayer.getlit.dev
✅ Initialized a Lit Auth client
🔄 Initializing Lit Auth EthWallet provider...
✅ Initialized Lit Auth EthWallet provider
🔄 Authenticating Lit Auth EthWallet provider...
✅ Authenticated Lit Auth EthWallet provider
🔄 Minting PKP via Relayer...
[Lit-JS-SDK v6.1.0] [2024-07-11T03:27:14.323Z] [DEBUG] [auth-client] Successfully initiated minting PKP with relayer
✅ Minted PKP via Relayer. Transaction hash: 0x8320d9a57f2237f0b2086753db5425087716940519e01620bee468b9f917db16
🔄 Fetching PKPs for user wallet...
Successfully fetched PKPs with relayer
✅ Fetched 1 PKP(s) for user wallet
🔄 Generating PKP Session Signatures with the user's PKP...
Storage key "lit-session-key" is missing. Not a problem. Contiune...
Storage key "lit-wallet-sig" is missing. Not a problem. Continue...
Unable to store walletSig in local storage. Not a problem. Continue...
Unable to store walletSig in local storage. Not a problem. Continuing to remove item key...
Unable to remove walletSig in local storage. Not a problem. Continuing...
✅ Generated PKP Session Signatures
🔄 Importing user's private key as a Lit Wrapped Key...
✅ Imported private key, and attached to PKP with address: 0x9844B24C90a8a7B846DddA3e9D642e5C38F7219C
🔄 Funding user's Ethereum address on Chronicle...
✅ Funded 0xcD2e41b42451EA1243d237A536ab2b3464318c06 with 0.00001 ether
🔄 Check Lit token balance for 0xcD2e41b42451EA1243d237A536ab2b3464318c06...
✅ Got balance: 0.00001 ether
🔄 Signing and sending a transaction with Wrapped Key...
✅ Signed and sent transaction. Transaction hash: 0x4601ac19e56068accda8980262b4e3f9d99fe757a081c65b1fa3351667848c6b
```
