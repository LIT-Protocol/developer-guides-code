# Getting Session Signatures using the `getSessionSigs` Method
## Understanding the Implementation
1. Using an imported ethereum private key, connect the wallet to the Lit RPC endpoint `Chronicle Yellowstone`
2. Connect to the Lit network using the LitNodeClient on the `datil-dev` network, specifying the local storage to hold the generated wallet and session keys
3. Generate the session signatures via an [Auth Sig](https://v6-api-doc-lit-js-sdk.vercel.app/interfaces/types_src.AuthSig.html) (Authentication Signature)

## Running this example
1. Copy the ENVs of the example: `cp .env.example .env`
2. Fill in the ENVs
    * `ETHEREUM_PRIVATE_KEY`: Ethereum private key for the address that will be signing the SIWE (Sign In with Ethereum) message within the Auth Sig
3. Install dependencides with `yarn`
4. Run the code example with `yarn test`
    * Status of the code example will be logged to the console