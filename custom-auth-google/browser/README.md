# Mint PKP Through Lit Relayer and Google OAuth

This code examples demonstrates how to mint a PKP and get PKP session signatures using Google OAuth to authenticate the user.

## Prerequisites

- Google OAuth Client ID and Secret
  - You can get these by creating a new project in the [Google Developer Console](https://console.cloud.google.com/apis/credentials)
- This code example uses Yarn

## Installation and Setup

1. Clone the repository
2. `cd` into the code example directory: `cd custom-auth-google/browser`
3. Install the dependencies: `yarn`
4. Create and fill in the `.env` file: `cp .env.example .env`
   - `VITE_GOOGLE_CLIENT_ID`: **Required** This is the Google OAuth Client ID
   - `VITE_GOOGLE_CLIENT_SECRET`: **Required** This is the Google OAuth Client Secret
5. Start the development server: `yarn dev`

## Executing the Example

1. Open the app in your browser: http://localhost:5173
2. Open the JavaScript browser console
3. Click the `Sign in with Google` button and connect your Google account
4. Click the `Mint PKP` button to mint a PKP using the authenticated Google account
5. Click the `Get PKP Session Sigs` button to get PKP session signatures using the authenticated Google account

### Expected Output

After clicking the `Mint PKP` button, the code example will mint a PKP and attach the authenticated Google account as a permitted auth method.

After successful execution, you should see `✅ Minted new PKP` in the JavaScript console and the PKP info on the web page.

Next click the `Get PKP Session Sigs` button to get PKP session signatures using the authenticated Google account, and you should see `✅ Got PKP Session Sigs` in the JavaScript console.

## Specific Files to Reference

- [App.tsx](./src/App.tsx): Contains the frontend code and the code for authenticating the Google account
- [lit/lit-action.ts](./src/lit/lit-action.ts): Contains the Lit Action code for authenticating a Google OAuth JWT to authorize signing using the PKP
- [lit/mint-pkp.ts](./src/lit/mint-pkp.ts): Contains the code for minting a PKP and attaching the authenticated Google account as a permitted auth method
- [lit/get-pkp-session-sigs.ts](./src/lit/get-pkp-session-sigs.ts): Contains the code for getting PKP session signatures using the authenticated Google account
