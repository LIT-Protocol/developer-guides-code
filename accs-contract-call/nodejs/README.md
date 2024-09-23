# Revoking Decryption Access Using the Lit SDK in Node.js

This code example demonstrates how access to decrypt data can be revoked using `EvmContractConditions` by making a request to an Access Control Contract.

## Understanding the Implementation

1. Using an imported Ethereum private key, connect the wallet to the Lit RPC endpoint `Chronicle Yellowstone`
2. Connect `LitNodeClient` to the Lit network (`datil-test` in this case)
3. Connect the `LitContracts` client to the Lit network (`datil-test` in this case)
4. Encrypt the string passed into the function. The string is encrypted with the `EVMContractConditions` defined at the beginning of the function
5. **If not provided in the .env file**: Mint a [`capacityCreditsNFT`](https://developer.litprotocol.com/sdk/capacity-credits) and define the request limit and expiration date
6. Create a `capacityDelegationAuthSig`. Any network costs will be undertaken by the `dAppOwnerWallet`
7. Generate a resource string using the `dataToEncryptHash` and `EVMContractConditions`. This ensures our session signatures can only attempt to decrypt the provided string
8. Generate the session signatures and decrypt the string

## Running this Example

### Install the Dependencies

In this directory, `accs-contract-call/nodejs`, run `yarn` to install the project dependencies.

### Setting Up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` file there are three ENVs

1. `ETHEREUM_PRIVATE_KEY` - **Required** Will be used to generate an Ethers.js wallet to perform message signing (CapacityDelegationAuthSig, AuthSig for session signatures)
2. `DEPLOYED_ACCESS_CONTROL_CONTRACT_ADDRESS` - **Required** The address of the deployed Access Control Contract
   - [The contract](../contracts/src/AccessControl.sol) has been deployed on the Lit Chronicle Yellowstone blockchain at: `0x4fc0c02ebbAbb81C04dB0C462C8c25cb37970eB1` for testing purposes
3. `LIT_CAPACITY_CREDIT_TOKEN_ID` - **Optional**
   - If provided, this [CapacityCredit](https://developer.litprotocol.com/paying-for-lit/capacity-credits) will be used to create an AuthSig to pay for usage the Lit network
   - If not provided, a new CapacityCredit will be minted and used to run this example. Please make sure that your wallet has enough `tstLPX` to pay for decryption on the Lit network

Your `.env` file should look like:

```
ETHEREUM_PRIVATE_KEY=
DEPLOYED_ACCESS_CONTROL_CONTRACT_ADDRESS=0x4fc0c02ebbAbb81C04dB0C462C8c25cb37970eB1
LIT_CAPACITY_CREDIT_TOKEN_ID=
```

### Running the Test

After the `.env` is configured, there is a NPM script in the `package.json` to run the test in the `test/index.spec.ts` file. To run the test, use the `yarn test` command.

### Contracts Directory

Outside of this directory is the `accs-contract-call/contracts` directory. It contains the contract used for testing in this example. If you'd like to see the complete setup or extend the example, you can check out the contracts directory.