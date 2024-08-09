# `getPkpSessionSigs` Code Example

This code demonstrates how to use the `getPkpSessionSigs` method from the Lit SDK.

## Understanding the Implementation
1. Using an imported Ethereum private key, connect the wallet to the Lit RPC endpoint `Chronicle Yellowstone`
2. Connect to the Lit network using the LitNodeClient on the `datil-test` network
3. Connect the `LitContracts` client to the Lit network
4. **If not provided in the arguments**: Mint a PKP using the `pkpNftContractUtils.write.mint` method from `LitContracts`.
    - You may receive a gas error if your `ethersSigner` has insufficient tokens. This can be fixed by acquiring more tokens from [the faucet](https://chronicle-yellowstone-faucet.getlit.dev/) for the `Chronicle Yellowstone` blockchain
5. **If not provided in the arguments**: Mint a [`capacityCreditsNFT`](https://developer.litprotocol.com/sdk/capacity-credits) and define the request limit and expiration date
6. Use the `capacityCreditsNFT` to create a `capacityDelegationAuthSig`
7. Generate a wallet signature to use as an [`AuthMethod`](https://v6-api-doc-lit-js-sdk.vercel.app/interfaces/types_src.AuthMethod.html)
8. Get the session signatures for the newly minted PKP. Any network costs will be undertaken by the `dAppOwnerWallet` specified in the `capacityDelegationAuthSig`

**NOTE**
---

When using `getPkpSessionSigs`, you have multiple authentication options. You're not strictly limited to using an `AuthMethod`, you can also use `AuthSigs`, or `Lit Actions`.

---

## Running the Examples

### Install the Dependencies

In this directory, `session-signatures/getPkpSessionSigs`, run `yarn` to install the project dependencies.

### Setting up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` there is the ENV:

1. `ETHEREUM_PRIVATE_KEY` - **Required**
    - Must have Lit `tstLPX` tokens on the `Chronicle Yellowstone` blockchain
        - [Faucet for Chronicle Yellowstone](https://chronicle-yellowstone-faucet.getlit.dev/)
    - Will be used to mint the PKP and pay for Lit usage

### Running the Test

After the `.env` is configured, there is a NPM script in the `package.json` to run the test in the `test/index.spec.ts` file. To run the test, use the `yarn test` command.
