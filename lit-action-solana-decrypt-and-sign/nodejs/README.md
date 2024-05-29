# Decrypting and Signing a Solana Transaction within a Lit Action

## Running this Example

1. Install the dependencies with `yarn`
2. Copy the `.env.example` file to `.env`: `cp .env.example .env`
3. Fill in the required ENVs
   - `ETHEREUM_PRIVATE_KEY` the corresponding address for the private key will be used for authorization to decrypt the Solana private key within the Lit Action
   - `SOLANA_PRIVATE_KEY` this private key will be encrypted client side, and will be decrypted within the Lit Action secure execution environment to sign a Solana transaction
4. Run the example with `yarn start`

After Step 4, the [Lit Action code](./src/litAction.js) will be compiled and the [example code](./src/index.ts) will be executed. The example code will:

1. Connect to the `cayenne` Lit Network
2. Encrypt `SOLANA_PRIVATE_KEY`, setting the Access Control Conditions to Authentication Signature from `ETHEREUM_PRIVATE_KEY`
3. Create a Lit Session Signature that allows for Lit Action execution and decryption, with a Authentication Signature from `ETHEREUM_PRIVATE_KEY`
4. Execute the Lit Action code to:
   1. Decrypt `SOLANA_PRIVATE_KEY` using signature shares from the Lit Nodes (within the Lit Action's secure execution environment)
   2. Initialize a Solana transaction
      - The recipient of the transaction is set via `SOLANA_TRANSACTION_RECIPIENT` within the [example code](./src/index.ts). It defaults to the corresponding address for `SOLANA_PRIVATE_KEY`
      - The transaction amount is set via `SOLANA_TRANSACTION_AMOUNT`
   3. Sign the Solana transaction using the decrypted private key
   4. Submit the transaction
   5. Return the transaction signature so the receipt can be obtained client side
5. The transaction signature returned by the Lit Action is then used to check for confirmation, and the transaction receipt is obtained and `console.log`ed
