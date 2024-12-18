# Encrypting a String for a Specific Solana Address

This example demonstrates how to use Lit Protocol to encrypt and decrypt data based on authenticated Solana public keys. It leverages three key components:

1. Lit Access Control Conditions
2. Sign-in With Solana (SIWS) messages (following [Phantom's specification](https://github.com/phantom/sign-in-with-solana/tree/main))
3. Lit Actions

By combining these technologies, we create a secure system for data decryption tied to Solana wallet authentication.

This code example has a [related doc page](https://developer.litprotocol.com/sdk/access-control/solana/siws-encryption) that covers a browser based implementation of this example in more detail. This repository acts as a reference implementation for you to use as a guide for restricting data decryption to specific Solana public keys in your project.

## Prerequisites

- An Ethereum private key
  - This private key will be used to:
    - Mint a Lit Capacity Credit if none was specific in the project's `.env` file
      - In order to pay for this, the corresponding Ethereum account must have Lit Test Tokens. If you do not have any, you can get some from [the faucet](https://chronicle-yellowstone-faucet.getlit.dev/)
    - Create a Lit Capacity Credit delegation Auth Sig
    - Mint a PKP
- A Solana private key
  - This private key will be used to sign the SIWS message
- This code example uses Node.js, Yarn, and Deno please have these installed before running the example

## Installation and Setup

1. Clone the repository
2. `cd` into the code example directory: `cd encryption/solana/encrypt-string`
3. Install the dependencies: `yarn`
4. Create and fill in the `.env` file: `cp .env.example .env`
   - `ETHEREUM_PRIVATE_KEY`: **Required** This is the Ethereum private key that will be used to mint a Lit Capacity Credit and create Lit Session Signatures
   - `SOLANA_PRIVATE_KEY`: **Required** This is the Solana private key that will be used to sign the SIWS message
   - `LIT_ACTION_CAPACITY_CREDIT_TOKEN_ID`: **Optional** This is the ID of the Lit Capacity Credit to use for the PKP delegation Auth Sig

## Executing the Example

`yarn test` will execute [index.spec.ts](./test/index.spec.ts) which will run the code example and output the results to the terminal

## Expected Output

After running the test file, you should see the following output in your terminal:

```bash
yarn run v1.22.22
$ yarn build:lit-action && dotenvx run -- mocha test/**/*.spec.ts
$ deno task bundle
Task bundle deno run --allow-read --allow-write --allow-env --allow-net --allow-run esbuild.js
[dotenvx@0.44.6] injecting env (3) from .env

  Testing Lit decryption using a Solana SIWS message
🔄 Getting Ethers signer...
✅ Got Ethers signer
🔄 Connecting LitNodeClient to the datil-dev network...
✅ Connected LitNodeClient to the datil-dev network
✅ Connected LitNodeClient to the datil-dev network
🔄 Connecting LitContracts Client to the datil-dev network...
✅ Connected LitContracts Client to the datil-dev network
ℹ️  Using existing Lit Capacity Credit Token ID: 692
🔄 Minting PKP...
✅ Minted PKP
ℹ️  Minted PKP with token id: 17833928440929751777545130185334438733119955474517814532227088965326387869956
ℹ️  Minted PKP with public key: 0x0477b972154af49622dcc64673d32a2bb55059604e56ad1c0787b6be6a83f7d085e3e48bf0abc92914bbe613c6ed73b358e9ebcc40653b4f522fc68f15a8ca0749
ℹ️  Minted PKP with ETH address: 0xAb1B809A272521317D850eB7eB371C3175F0cD8f
🔄 Creating capacityDelegationAuthSig...
✅ Capacity Delegation Auth Sig created
🔄 Generating access control conditions...
✅ Generated access control conditions
🔄 Encrypting the string...
✅ Encrypted the string
ℹ️  ciphertext: ti48snWgqNcoGN37St4orx/LBclc7nZPHxTnRGndIaNcKFgKg0M+M85ovCF39p9kH3SftJYpxHY6q85cZOUxHc9rYL5hxGUEBWBBIKy5I7g4UsA1IzTLaPUEtKpdUK1HaWH8XRg0WGKMWsknmsJrCDS55uzpsBPrMJZypUVKWfdqrHKdcOX20/IC
ℹ️  dataToEncryptHash: 5ad8f16e45a2f21c693ea4e9376e46424abbf8f74838a5bd8f6173c54ba2e87a
🔄 Generating SIWS message...
✅ Generated SIWS message:
localhost wants you to sign in with your Solana account:
5ZS9h2jYtKVrPM19JSdgdaEE4UweSEQGgtwmfuFyqLan

This is a test statement, replace this with whatever you want

URI: http://localhost:3000
Expiration Time: 2024-12-18T03:00:42.887Z
🔄 Signing SIWS message...
✅ Signed SIWS message: 517Vr82ZUMmeCavpTebGrmqdP8aFpwZcr1DkT7MEnewuDsfcgHj16g6kCi1rrm4KdJC6AMTPvrDNKGRFnuYqUWq1
🔄 Getting session sigs...
✅ Got session sigs
🔄 Decrypting data...
✅ Decrypted data
    ✔ should decrypt the string (4390ms)


  1 passing (4s)

✨  Done in 7.22s.
```

## Specific Files to Reference

- [index.ts](./src/index.ts): Contains the code for the example
- [index.spec.ts](./test/index.spec.ts): Contains the code for the test file that runs the example
- [utils.ts](./src/utils.ts): Contains the code for the utility functions used in the example
- [litActionSessionSigs.ts](./src/litActions/litActionSessionSigs.ts): Contains the Lit Action code that authenticates the SIWS message, checks the PKPs permitted Auth Methods, and signals the Lit Network to generate Session Signatures
- [litActionDecrypt.ts](./src/litActions/litActionDecrypt.ts): Contains the Lit Action code that makes the decryption request to the Lit Network
- [common.ts](./src/litActions/common.ts): Contains helpers functions for generating SIWS messages and verifying SIWS signatures for the Lit Actions to use
