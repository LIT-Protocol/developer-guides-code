# `signAndCombineEcdsa` Lit Action Code Example

This code demonstrates how to use the Lit and Lit Actions SDKs to implement the `signAndCombineEcdsa` method in a Lit Action. This method combines the signature shares of your PKP from each node in a single node within a Lit Action, meaning they remain in [Lit's Trusted Execution Environment (TEE)](https://developer.litprotocol.com/resources/how-it-works#sealed-and-confidential-hardware) and are not exposed to the client.

## Understanding the Implementation

1. Using an imported Ethereum private key, connect the wallet to the a RPC endpoint of the network you plan to execute the transactions on
2. Connect an ethers Provider to the Lit RPC endpoint `Chronicle Yellowstone`. This will be used to pay for Lit usage
3. Connect the `LitContracts` client to the Lit network (`datil-test` in this case)
4. **If not provided in the .env file**: Mint a PKP using the `pkpNftContractUtils.write.mint` method from `LitContracts`
5. If the PKP will not have enough funds to pay for the transaction, fund the PKP. This amount largely depends on the gas price of the network you are using
6. Connect to the Lit network using the `LitNodeClient` on the `datil-test` network
7. Create and serialize an unsigned transaction. This transaction will be signed in the Lit Action code
8. **If not provided in the .env file**: Mint a [`capacityCreditsNFT`](https://developer.litprotocol.com/sdk/capacity-credits) and define the request limit and expiration date
9. Create a `capacityDelegationAuthSig`. Any network costs will be undertaken by the `dAppOwnerWallet`
10. Use the `executeJs` method to execute the Lit Action code. This step also involves generating the session signatures for the PKP, specifying the ability to sign transactions and execute `Lit Actions`.

## **NOTE**

The chain on which the transactions for funding the PKP and having the PKP send funds back to the wallet can be easily changed by modifying the `CHAIN_TO_SEND_TX_ON` ENV. Please do make sure that the wallet you are using has sufficient funds to pay for the gas fees, transactions, and is supported by Lit. A list of supported chains can be found [here](https://developer.litprotocol.com/resources/supported-chains).

---

## Running the Examples

### Install the Dependencies

In this directory, `sign-and-combine-ecdsa/nodejs`, run `yarn` to install the project dependencies.

### Setting up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` file there are the following ENVs:

1. `ETHEREUM_PRIVATE_KEY` - **Required**
   - Must have Lit `tstLPX` tokens on the `Chronicle Yellowstone` blockchain
     - [Faucet for Chronicle Yellowstone](https://chronicle-yellowstone-faucet.getlit.dev/)
   - Will be used to mint the PKP and pay for Lit usage
2. `CHAIN_TO_SEND_TX_ON` - **Required**
   - The chain on which the transactions for funding the PKP and having the PKP send funds back to the wallet can be easily changed by modifying the `CHAIN_TO_SEND_TX_ON` ENV.
3. `LIT_CAPACITY_CREDIT_TOKEN_ID` - **Optional**
   - If not provided, a new `capacityCreditsNFT` will be minted and used. This enables the `ETHEREUM_PRIVATE_KEY` to pay for Lit usage
4. `LIT_PKP_PUBLIC_KEY` - **Optional**
   - This is the PKP used to sign and send the transaction. If not provided, a new PKP will be minted (`ETHEREUM_PRIVATE_KEY` will be used to pay the minting fee).

### Running the Test

After the `.env` is configured, there is a NPM script in the `package.json` to run the test in the `test/signAndCombineAndSendTx.spec.ts` file. To run the test, use the `yarn test` command.
