# Minting a PKP Using Telegram OAuth

This code examples demonstrates how to mint a new PKP using a user's Telegram OAuth info.

## How to Run It

1. `git checkout -b origin/wyatt/mint-pkp-custom-auth wyatt/mint-pkp-custom-auth`
2. `cd mint-pkp-with-custom-auth`
3. `cp .env.example .env`
4. Fill in the `.env`:
   - `VITE_LIT_CAPACITY_CREDIT_TOKEN_ID` Optional - The token ID for an existing Lit Capacity Credit token ID. If not provided, then wallet connected to the app to run the example will be used to mint a new token. New Capacity Credit info will `console.log`ged, and the printed token ID can then be set for this ENV.
   - `VITE_TELEGRAM_BOT_SECRET` Required - The secreted generated for your Telegram bot. For information on how to create a Telegram bot, go [here](https://core.telegram.org/bots#how-do-i-create-a-bot).
     - NOTE This secret will be exposed to the client, and the code implementation for this example should be moved server side so the secret is no longer exposed to the client.
     - The public domain your bot is connecting to should be `https://mint-pkp-telegram.loca.lt` or whatever you end up setting the `--subdomain` flag to for the `start:tunnel` script in [package.json](./package.json).
   - `VITE_LIT_ACTION_IPFS_CID` Required - The IPFS CID of the Lit Action that will handle the authentication and authorization of the user's Telegram OAuth info.
     - `QmYkfxk3hQ6JG2DdobNTKoxXy15ehSuunnUe1aK43PTcFD` can be used, as it's the CID of the [Lit Action code](./src/litAction.js) in this example.
   - Using the `upload:lit-action` script in [package.json](./package.json), you can upload the [Lit Action code](./src/litAction.js) to IPFS via Pinata.
     - `PINATA_API_KEY` Optional - This is the public API key.
     - `PINATA_SECRET_API_KEY` Optional - This is the secret API key.

In order to use Telegram OAuth, your bot that provides the OAuth info needs to have access to a public endpoint for your application. This example makes use of the [localtunnel](https://www.npmjs.com/package/localtunnel) package to expose `localhost` to the public, and therefore your Telegram bot. This implementation works for local development, although it's finicky (usually it fails to load the app correctly, but refreshing the page until it loads usually works). The following steps will continue with running this example locally, however if you'd like to avoid the flakiness of using `localtunnel`, you can copy this entire code example into your own repo and host via [Vercel](https://vercel.com). This shouldn't require any other configuration in Vercel besides copying over the ENV variables.

5. `yarn` to install the dependencies
6. `start:dev` will start `localtunnel` and the Vite development server. After this starts up successfully, the app should be available publicly at https://mint-pkp-telegram.loca.lt
   - Note that the app requests to use `mint-pkp-telegram` subdomain from `localtunnel`, but it may not be available. If you get errors pertaining to this, just change the `--subdoamin` flag for the `start:tunnel` script in [package.json](./package.json).

## Minting the PKP

You'll be presented with three steps:

1. Connecting your Telegram using the [Telegram Login Widget](https://core.telegram.org/widgets/login) button.
   - This will connecting to Telegram's OAuth API, and return your OAuth info to the app.
   - In the browser JavaScript console, you should see that your Telegram user info was received and validated locally.
2. Click the `Mint PKP` button to request your browser wallet (I've test this with MetaMask) to sign the transaction to mint a PKP.

   - In the browser JavaScript console, you will see status updates of what the app is doing, and eventually the info for the minted PKP.
   - You will also see something similar to:

   ```json
   ✅ Got permitted auth methods: [
   [
       {
       "type": "BigNumber",
       "hex": "0x02"
       },
       "0x12209abc398730cc5b6c7c79bc2e85ed297fb9d1903d053e490332ba82c369388e94",
       "0x"
   ],
   [
       {
       "type": "BigNumber",
       "hex": "0xdb65cd6190b9661f16c0c571975af1ea9d4a22057864d3d6556e6cef2a2e509f"
       },
       "0x7222bf623a2643b889a1f0c9445cadad795462165d44e6011ff3bab974e9c171",
       "0x"
   ],
   [
       {
       "type": "BigNumber",
       "hex": "0x01"
       },
       "0xbb56772fce09268af47947712e9321f5751c4628",
       "0x"
   ]
   ]
   ```

   these are the permitted Auth Methods for the new PKP, retrieved from the [PKPPermissionsFacet](https://github.com/LIT-Protocol/lit-assets/blob/d25a81bae106b0c1253f2cfc299f026874c956f6/blockchain/contracts/contracts/lit-node/PKPPermissions/PKPPermissionsFacet.sol#L132-L149) contract on the Chronicle Yellowstone blockchain. The first Auth Method corresponds to the Lit Action that we've granted the ability to sign anything using our PKP. The second is a custom Auth Method ID that corresponds to the Telegram user info that was used to mint the PKP. This Auth Method doesn't have the ability to sign anything, but is used within the Lit Action to verify the Telegram user requesting to sign with the PKP is authorized to use this specific PKP. The third Auth Method is the PKP's address which has the ability to sign transactions/messages using the PKP.

3. Click the `Get Session Sigs` button to request Session Sigs be generated using the minted PKP.
   - This will request your browser wallet to sign a SIWE message that grants the minted PKP to use your Capacity Credit to run the Lit Action to generate the Session Sigs.
   - After this runs, you will have ran a Lit Action that authenticates user Telegram OAuth info and checks if the specific user is authorized to use the PKP, afterwards the Lit network will generate Session Sigs using the minted PKP.

## How the Example Works

- [App.tsx](./src/App.tsx) is the frontend code for the app.
  - This file contains the React logic for the buttons, but also includes code that authenticates the received Telegram OAuth info as a sanity check.
- [TelegramLoginButton.tsx](./src/TelegramLoginButton.tsx) is the frontend code for the Telegram Login Widget button.
- [mintPkp.ts](./src/mintPkp.ts) contains the logic for minting the PKP.
  1. It connects to a browser wallet using `new ethers.providers.Web3Provider(window.ethereum);`.
  2. Connects a `LitContracts` instance to the Lit network, Datil-test.
  3. Generates the Lit Auth Method type and ID
     - The Auth Method types if the `keccak256` hash of the string: `Lit Developer Guide Telegram Auth Example`
     - The Auth Method ID is the `keccak256` hash of the string: `telegram:${telegramUser.id}` where `telegramUser.id` is the ID in the Telegram OAuth info for the authenticated Telegram user.
  4. Gets the PKP mint cost from the PKP facet contract.
  5. Makes a request to the Chronicle Yellowstone blockchain to mint a new PKP.
     - `VITE_LIT_ACTION_IPFS_CID` is set as an authorized Auth Method to sign anything using the PKP.
     - `telegram:${telegramUser.id}` is set as a permitted Auth Method, but it is not authorized to sign anything using the PKP. Setting this as a permitted Auth Method allows the Lit Action to check if a specific authenticated Telegram user is allowed to use a specific PKP.
  6. The PKP is minted and the PKP info is parsed for the transaction receipt.
- [getPkpSessionSigs.ts](./src/getPkpSessionSigs.ts) contains the logic for requesting Session Sigs using the minted PKP.
  1. It connects to a browser wallet using `new ethers.providers.Web3Provider(window.ethereum);`.
  2. Connects a `LitNodeClient` instance to the Lit network, Datil-test.
  3. Connects a `LitContracts` instance to the Lit network, Datil-test.
  4. If a Capacity Credit token ID wasn't specified in the `.env` file, then the browser wallet is request to sign a transaction to mint a new credit, and the signed tx is submitted to the Chronicle Yellowstone blockchain.
  5. A request to the Lit network to run the Lit Action is made, if successful, Session Sigs are generated using the minted PKP.
- [litAction.js](./src/litAction.js) contains the Lit Action code
  - This Lit Action uses the [crypto-js](https://www.npmjs.com/package/crypto-js) package for perform the required hashing to authenticate the provided Telegram user data.
  - The Lit Action is hardcoded to only communicate with the PKP Permission contract deployed on Chronicle Yellowstone at `0x60C1ddC8b9e38F730F0e7B70A2F84C1A98A69167`.
  - It's also hardcoded to only use the Auth Method with the type: `keccak256('Lit Developer Guide Telegram Auth Example')`.
  1. The Lit Action will validate the provided Telegram OAuth info using [this method](https://core.telegram.org/widgets/login#checking-authorization). It also verifies the the authenticated info is not older than 10 minutes.
  2. A request to the PKP Permissions contract is made to check if the authenticated Telegram user is authorized to use the PKP.
     - This is done by checking if `telegram:${_telegramUserData.id}` (using the authenticated Telegram user ID provided to the Lit Action) is a permitted Auth Method for the PKP token ID (provided to the Lit Action).
  3. If the provided Telegram OAuth info is recent and authenticated, and the Telegram user is permitted to use the PKP, then the Lit Action returns `Lit.Actions.setResponse({ response: "true" });` signaling the Lit network to produce Session Sigs for the PKP.
