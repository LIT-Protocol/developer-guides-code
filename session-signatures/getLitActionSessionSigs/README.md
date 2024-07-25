# `getLitActionSessionSigs` Code Example

This code demonstrates how to use the `getLitActionSessionSigs()` method from the Lit SDK.

## Understanding the Implementation
1. Using an imported Ethereum private key, connect the wallet to the Lit RPC endpoint `Chronicle Yellowstone`
2. Connect to the Lit network using the `LitNodeClient` on the `datil-dev` network, specifying the local storage to hold the generated wallet and session keys
3. Connect the `LitContracts` client to the Lit network
4. Mint a PKP using the `pkpNftContractUtils.write.mint()` method from `LitContracts`.
    - You may receive a gas error if your `ethersSigner` has insufficient tokens. This can be fixed by acquiring more tokens from [the faucet](https://chronicle-yellowstone-faucet.getlit.dev/) for the `Chronicle Yellowstone` blockchain
5. Get the session signatures for the newly minted PKP, specifying the ability to execute `Lit Actions`

**NOTE**
---

 `getLitActionSessionSigs()` returns a PKP session signature, but it's purpose is to implement custom authentication/authorization within a Lit Action. An example of using `getLitActionSessionSigs` for custom authentication can be found [here](https://github.com/LIT-Protocol/developer-guides-code/blob/master/custom-auth/browser/src/index.ts#L284).

---

## Running the Examples

### Install the Dependencies

In this directory, `session-signatures/getLitActionSessionSigs`, run `yarn` to install the project dependencies.

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
