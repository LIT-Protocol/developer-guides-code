# Payment Delegation Database

<!-- TODO Add link to docs once it's published -->

This directory contains an example usage of the Payment Delegation Database to register a new payer wallet, and add users as payees. There is a corresponding Lit docs page that covers the code in this example which is available here.

## Getting Started

1. After cloning this repo, `cd` into this directory:
   ```
   cd payment-delegation-db-relayer/nodejs
   ```
2. Install the dependencies with: `yarn`
3. Initialize the `.env` file by copy `.env.example`:
   ```
   cp .env.example .env
   ```
4. Fill out the `.env`
   - For the `LIT_NETWORK` variable, the following options are available:
     - `habanero`
     - `manzano`
     <!-- Add link to form -->
   - For the `LIT_RELAYER_API_KEY` variable, if you don't already have a Relayer API key, you can fill out this form to request one.
   - You may not already have a Payer wallet secret key to use for the `LIT_PAYER_SECRET_KEY` variable. In this case, you can run the [registerPayer.spec.ts](./test/registerPayer.spec.ts) test file to generate one:
     ```ts
     npx @dotenvx/dotenvx run -- mocha test/registerPayer.spec.ts
     ```
     - The `LIT_NETWORK` and `LIT_RELAYER_API_KEY` variables are required in order for this test to run successfully and generate a Payer wallet secret ket
     - Running this test will log the following to the console:
       ```json
       Registered a new payer wallet:  {
           payerWalletAddress: '0x6133D5Ad3018981B90EC7849d4025e46aa976174',
           payerSecretKey: '/tYbYhv8zy67SKYP51Vx7k4nVV=+41VhuofPDj63vM5QgUZkUfAbhdPVCV3ByZnCIxRT6hWo9fVuVVktQaDHfOQ=='
       }
       ```
       `payerSecretKey` is what you'll want to set for the `LIT_PAYER_SECRET_KEY` variable
5. Run `yarn test` to execute both tests
   - In order for both tests to successfully run, you **must** have all the `.env` variables provided
