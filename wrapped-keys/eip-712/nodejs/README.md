# EIP-712 Signatures using Wrapped Keys

This code example demonstrates how to sign an EIP-712 message using a Wrapped Key.

## Prerequisites

- An Ethereum private key
  - This private key will be used to:
    - Mint a Lit Capacity Credit if none was specific in the project's `.env` file
      - In order to pay for this, the corresponding Ethereum account must have Lit Test Tokens. If you do not have any, you can get some from [the faucet](https://chronicle-yellowstone-faucet.getlit.dev/)
    - Create a Lit Capacity Credit delegation Auth Sig
    - Mint a PKP
    - Generate PKP Session Signatures
- This code example uses Node.js and Yarn please have these installed before running the example

## Installation and Setup

1. Clone the repository
2. `cd` into the code example directory: `cd wrapped-keys/eip-712/nodejs`
3. Install the dependencies: `yarn`
4. Create and fill in the `.env` file: `cp .env.example .env`
   - `ETHEREUM_PRIVATE_KEY`: **Required** This is the Ethereum private key that will be used to mint a Lit Capacity Credit and create Lit Session Signatures
   - `CAPACITY_CREDIT_TOKEN_ID`: **Optional** This is the ID of the Lit Capacity Credit to use for the PKP delegation Auth Sig
   - `LIT_NETWORK`: **Optional** This is the Lit Network to use for the Lit Contracts and Lit Node Clients

## Executing the Example

1. Run `yarn test` to execute the examples-authentication.png)

### Expected Output

```
  Signing an EIP-712 message using a Wrapped Key
🔄 Generating EIP-712 message...
✅ Generated and serialized EIP-712 message: {"domain":{"name":"Ether Mail","version":"1","chainId":1,"verifyingContract":"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"},"types":{"Person":[{"name":"name","type":"string"},{"name":"wallet","type":"address"}],"Mail":[{"name":"from","type":"Person"},{"name":"to","type":"Person"},{"name":"contents","type":"string"}]},"primaryType":"Mail","message":{"from":{"name":"Alice","wallet":"0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"},"to":{"name":"Bob","wallet":"0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"},"contents":"Hello, Bob!"}}
🔄 Connecting LitNodeClient to Lit network...
✅ Connected LitNodeClient to Lit network
🔄 Connecting LitContracts client to network...
✅ Connected LitContracts client to network
🔄 Minting Capacity Credits NFT...
✅ Minted new Capacity Credit with ID: 25144
🔄 Minting new PKP...
✅ Minted new PKP with public key: 04cf95d05f3e237fef866f7daf169be4b773ced0cbcc2ce260b03b63026fc858ea182dabad3bdb37c49554527b92dbe53b260d3934dfde18e0fac8a03ccb10fe09 and ETH address: 0xC3bb43D840801959890A565bB58A0290fF0FE8Be
🔄 Creating capacityDelegationAuthSig...
✅ Created the capacityDelegationAuthSig
🔄 Getting PKP Session Sigs...
Storage key "lit-session-key" is missing. Not a problem. Contiune...
Storage key "lit-wallet-sig" is missing. Not a problem. Continue...
Unable to store walletSig in local storage. Not a problem. Continue...
✅ Got PKP Session Sigs
🔄 Generating wrapped key...
✅ Generated wrapped key with id: 1133b4d5-2ffb-46c3-951d-0f0d7f4ccde2 and public key: 0x0402e173bf643ae623771b24cdda0ca01bec0409ca01d67f02090961c1394e81e1dd78c80fa3e116b0be032616d907f2775a4e9e1dc4cc08d19cbec0e51b1f83af
🔄 Getting wrapped key metadata...
✅ Got wrapped key metadata: {
  "ciphertext": "okHLOUDld4UJD+LaDz++3QVDngfm/mz9HNPDuOlnJHH/iiCPiDT2Adnn6odOuw2igW8g3cclh0PDwoZO97zdsEmCfQrs2UuUEzR844n/S01HmO7exNHAVRglrK9azstkShE+0/KcIWjG3I2x6BCX9OfvJcTDb/LX2okN5HxLDNZMNuNtdBK11GAkfqPoV28AoBpj/oYdnw4C",
  "dataToEncryptHash": "76f7ff2ae254f0771089216fe8413a768f189242fa1b406c3805edaf7c64dc13",
  "id": "1133b4d5-2ffb-46c3-951d-0f0d7f4ccde2",
  "keyType": "K256",
  "pkpAddress": "0xC3bb43D840801959890A565bB58A0290fF0FE8Be",
  "publicKey": "0x0402e173bf643ae623771b24cdda0ca01bec0409ca01d67f02090961c1394e81e1dd78c80fa3e116b0be032616d907f2775a4e9e1dc4cc08d19cbec0e51b1f83af",
  "litNetwork": "datil-test"
}
🔄 Signing EIP-712 message with Wrapped Key...
✅ Signed EIP-712 message
```

## Specific Files to Reference

- [index.ts](./src/index.ts): Contains the code for:
  - Minting a PKP
  - Generating PKP Session Signatures
  - Generating a Wrapped Key
  - Getting the Wrapped Key metadata
  - Making the request to execute the Lit Action that signs an EIP-712 message using the Wrapped Key
- [utils.ts](./src/utils.ts): Contains utility functions for the example
- [wrappedKeyLitAction.ts](./src/wrappedKeyLitAction.ts): Contains the Lit Action code that signs an EIP-712 message
- [index.spec.ts](./test/index.spec.ts): Contains the example EIP-712 message and test the example
