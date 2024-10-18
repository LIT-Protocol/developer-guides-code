# File Encryption/Decryption Using the Lit SDK in Node.js

This code example demonstrates how the Lit SDK can be used to encrypt and decrypt file data within a Node.js application.

## Running this Example

### Install the Dependencies

In this directory, `encryption-decryption/nodejs`, run `yarn` to install the project dependencies.

### Setting Up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` file there are two ENVs

1. `ETHEREUM_PRIVATE_KEY` - **Required** Will be used to generate an Ethers.js wallet to perform the signing of transactions
2. `LIT_CAPACITY_CREDIT_TOKEN_ID` - **Optional**
   - If provided, this [CapacityCredit](https://developer.litprotocol.com/paying-for-lit/capacity-credits) will be used to create an AuthSig to pay for usage the Lit network
   - If not provided, a new CapacityCredit will be minted and used to run this example. Please make sure that your wallet has enough `tstLPX` to pay for execution of the Lit Action

Your `.env` file should look like:

```
ETHEREUM_PRIVATE_KEY=YourPrivateKey
LIT_CAPACITY_CREDIT_TOKEN_ID=yourCapacityCreditTokenId
```

### Starting the Example

In this directory, `encryption-decryption/nodejs`, run `yarn test:encrypt` to test the encryption of a file, and `yarn test:decrypt` to test the decryption of a file. These commands will run the tests in the `test` directory, which are for the `encryptFile.ts` and `decryptFile.ts` files in the `src` directory.

`encryptFile.ts`:

1. Requires a blob created from a file and contract conditions to encrypt the file
2. Connects to the Lit network
3. Encrypts the file and returns the `ciphertext` and `dataToEncryptHash`

`decryptFile.ts`:

1. Connects to the Lit network and LitContracts client
2. Mints a new CapacityCredit if a CapacityCredit tokenId is not provided in the `.env` file and creates a capacityDelegationAuthSig to pay for use of the Lit network, which is decrypting data in this case
3. Generates session signatures with the ability to decrypt the file
4. Decrypts the file and returns a decrypted file buffer

The tests created in the `test` directory are slightly more complex.

`encryptFileWithContractConditions.spec.ts`:

```
yarn test:encrypt
```

Encrypt the file with specific `evmContractConditions`. These conditions check the [ERC1271](./test/fixtures/ERC1271.sol) contract address on the Chronicle Yellowstone network and calls the `isValidSignature` function, expecting to return true if the signature is valid. This means that the encrypted file can only be decrypted if the same contract conditions are able to return true while decrypting.

`decryptFileWithContractConditions.spec.ts`:

```
yarn test:decrypt
```

Decrypts the file.
