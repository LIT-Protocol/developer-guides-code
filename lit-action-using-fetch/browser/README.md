# Implementing Fetch Within a Lit Action in the Browser

This code example demonstrates a Lit Action that fetches data from an API and conditionally signs a message based on the retrieved information.

## Understanding the Implementation

1. You will be prompted by your wallet (i.e. MetaMask) to connect an account to the site
2. Connect to the Lit network using the `LitNodeClient` on the `datil-test` network
3. Connect the `LitContracts` client to the Lit network (`datil-test` in this case)
4. **If not provided in the .env file**: Mint a [`PKP`](https://developer.litprotocol.com/user-wallets/pkps/overview)
5. **If not provided in the .env file**: Mint a [`capacityCreditsNFT`](https://developer.litprotocol.com/sdk/capacity-credits) and define the request limit and expiration date
6. You will then be prompted to sign a message, this message will create the `capacityDelegationAuthSig` that will be used to pay for Lit usage
7. After signing, the Lit Action will be executed. The console will then show the Lit Action response and whether the signature was successful

## Running this Example

### Install the Dependencies

In this directory, `lit-action-using-fetch/browser`, run `yarn` to install the project dependencies.

### Specifying Your Lit PKP's Public Key and CapacityCredit Token ID

If you already have a Lit PKP that you'd like to use, you can copy the contents of the provided `.env.example` to a `.env` file to specify it. If you don't have a PKP, or wish to use a new one for this example, then you can skip this step and one will be created for you when you run this example. This is also the case for the Lit Capacity Credit Token ID; you can provide one or have one minted for you.

**NOTE** In order for a new Lit PKP to be minted for you, you **must** have `tstLPX` tokens. You can receive some `tstLPX` using the faucet available [here](https://chronicle-yellowstone-faucet.getlit.dev/).

```
cp .env.example .env
```

Your `.env` file should look like:

```
VITE_LIT_PKP_PUBLIC_KEY=yourPublicKey
VITE_LIT_CAPACITY_CREDIT_TOKEN_ID=yourCapacityCreditTokenId
```

### Starting the Example

In this directory, `lit-action-using-fetch/browser`, run `yarn dev` to bundle all of this code and serve the HTML file at: [http://localhost:5173](http://localhost:5173).

After starting and waiting for Vite to serve the website, you should see a page with a single button that says: `Run Example`.

Before you click the button, open up the JavaScript console in your browser so you can see the output of this example.