# Getting Session Signatures using the `getPkpSessionSigs` Method
## Understanding the Implementation
1. Using an imported ethereum private key, connect the wallet to the Lit RPC endpoint `Chronicle Yellowstone`
2. Connect to the Lit network using the LitNodeClient on the `datil-dev` network, specifying the local storage to hold the generated wallet and session keys
3. Initialize a secure connection through the Lit login with LitAuthClient using the `LIT_RELAYER_API_KEY`
4. Generate a wallet signature to use as an [Auth Method](https://v6-api-doc-lit-js-sdk.vercel.app/interfaces/types_src.AuthMethod.html)
5. Use the Auth Method to mint a PKP through the LitAuthClient
6. Get the session signatures for the newly minted PKP

## Running this example
1. Copy the ENVs of the example: `cp .env.example .env`
2. Fill in the ENVs
    * `ETHEREUM_PRIVATE_KEY`: Ethereum private key for the address that will be used in generating the Auth Method
    * `LIT_RELAYER_API_KEY`: Lit Relayer API key, used for secure connection through the Lit login within the LitAuthClient
3. Install dependencides with `yarn`
4. Run the code example with `yarn test`
    * Status of the code example will be logged to the console