# String Encryption/Decryption Using the Lit SDK in the Browser

This code example demonstrates how the Lit SDK can be used to encrypt and decrypt data within a browser.

## Running this Example

### Install the Dependencies

In this directory, `encryption-decryption/browser`, run `yarn` to install the project dependencies.

### Specifying Your Lit Capacity Credit's Token ID

If you already have a Lit Capacity Credit that you'd like to use, you can copy the contents of the provided `.env.example` to a `.env` file to specify it. If you don't have a Capacity Credit, or wish to use a new one for this example, then you can skip this step and one will be minted for you when you run this example.

**NOTE** In order for a new Lit Capacity Credit to be minted, you **must** have `tstLPX` tokens. You can receive some `tstLPX` using the faucet available [here](https://faucet.litprotocol.com/).

```
cp .env.example .env
```

Your `.env` file should look like:

```
VITE_LIT_CAPACITY_CREDIT_TOKEN_ID=yourCapacityCreditTokenId
```

### Starting the Example

In this directory, `encryption-decryption/browser`, run `yarn dev` to bundle all of this code and serve the HTML file at: [http://localhost:5173](http://localhost:5173).

Before you click the buttons, open up the JavaScript console in your browser so you can see the output of this example.

After typing in the text you want to encrypt, clicking the `Encrypt String` button will:

1. You will be prompted by your wallet (i.e. MetaMask) to connect an account to the site
2. After connecting an account, the console should display a successful connection to the Lit network and the encrypted `ciphertext` and `dataToEncryptHash` that will later be used to decrypt the string.

After encrypting the string, clicking the `Decrypt String` button will:

1. Connect you to the Lit network and LitContracts client
2. If you did not provide a Capacity Credit token ID, you will be prompted by your wallet to mint a new one
3. You will then be prompted by your wallet to sign a message. This message will create a `capacityDelegationAuthSig`, which is used to pay for decrypting data ([and other functionality](https://developer.litprotocol.com/paying-for-lit/capacity-credits)) on the Lit 
4. You will then be prompted by your wallet to sign another one final message. This message is the SIWE message that will derive your address from to use for the conditional check of whether or not you are permitted to decrypt the data

The full example should look something like:


https://github.com/user-attachments/assets/7ddbee56-ef43-402c-9bd4-0e648be15f23


