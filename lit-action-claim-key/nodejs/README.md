# Claim a Deterministically Derived PKP Using a User ID

This code demonstrates how to use a custom user ID to deterministically generate a PKP. This enables us to know the PKP public key and Ethereum address before minting the PKP.

You can read more about claimable keys [here](https://developer.litprotocol.com/user-wallets/pkps/claimable-keys/intro), and how to claim keys using a Lit Action [here](https://developer.litprotocol.com/sdk/serverless-signing/key-claiming).

## Understanding the Implementation

1. Using an imported Ethereum private key, connect the wallet to the Lit RPC endpoint `Chronicle Yellowstone`. This will be used to pay for Lit usage
2. Use the `LitNodeClient` to connect to the Lit network
3. Connect the `LitContracts` client to the Lit network (`datil-test` in this case)
4. **If not provided in the .env file**: Mint a [`capacityCreditsNFT`](https://developer.litprotocol.com/sdk/capacity-credits) and define the request limit and expiration date
5. Create a `capacityDelegationAuthSig`. Any network costs will be undertaken by the `dAppOwnerWallet`
6. Generate the session signatures via an [`AuthSig`](https://v6-api-doc-lit-js-sdk.vercel.app/interfaces/types_src.AuthSig.html) (Authentication Signature)
7. Create a `userId` by combining an arbitrary string, which could be a username, and the current timestamp. This is to ensure the `userId` is unique
8. Execute the [Lit Action](./litAction.ts). The Lit Action will derive a `keyId` from the `userId`
9. Use the `LitContracts.pubkeyRouterContract.read.getDerivedPubkey` method to derive a PKP public key from the `keyId`
10. Use the `litContractClient.pkpNftContract.write.claimAndMint` method to claim the derived PKP public key, and mint a new PKP that has the same public key
11. Wait for the transaction to finish, and derive the PKP public key, token ID, and ETH address from the transaction receipt

## Running the Example

### Install the Dependencies

In this directory, `lit-action-claim-key/nodejs`, run `yarn` to install the project dependencies.

### Setting Up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` there are the ENVs:

1. `ETHEREUM_PRIVATE_KEY` - **Required**
   - Must have Lit `tstLPX` tokens on the `Chronicle Yellowstone` blockchain
     - [Faucet for Chronicle Yellowstone](https://chronicle-yellowstone-faucet.getlit.dev/)
   - Will be used to mint the PKP and pay for Lit usage
2. `LIT_CAPACITY_CREDIT_TOKEN_ID` - **Optional**
   - If not provided, a new `capacityCreditsNFT` will be minted and used. This enables the `ETHEREUM_PRIVATE_KEY` to pay for Lit usage

### Running the Tests

After the `.env` is configured, the `test` NPM script in the `package.json` will run a test that executes the example script. Run it using:

```
yarn test
```