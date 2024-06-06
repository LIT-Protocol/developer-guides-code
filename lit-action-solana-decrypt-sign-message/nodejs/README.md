# Decrypting A Solana Private key and Signing a Message within a Lit Action

## Running this Example

1. Install the dependencies with `yarn`
2. Copy the `.env.example` file to `.env`: `cp .env.example .env`
3. Fill in the required ENVs
   - `ETHEREUM_PRIVATE_KEY` the corresponding address for the private key will be used for authorization to decrypt the Solana private key within the Lit Action
   - `SOLANA_PRIVATE_KEY` this private key will be encrypted client side, and will be decrypted within the Lit Action secure execution environment to sign a Solana transaction
4. Run the test with: `yarn test`

After Step 4, the [Lit Action code](./src/litAction.js) will be compiled and the [example code](./src/index.ts) will be executed via the test file [decryptKeyAndSignMessage.spec.ts](./test/decryptKeyAndSignMessage.spec.ts). The example code will:

1. Connect to the `cayenne` Lit Network
2. Encrypt `SOLANA_PRIVATE_KEY`, setting the Access Control Conditions to Authentication Signature from `ETHEREUM_PRIVATE_KEY`
3. Create a Lit Session Signature that allows for Lit Action execution and decryption, with a Authentication Signature from `ETHEREUM_PRIVATE_KEY`
4. Execute the Lit Action code to:
   1. Decrypt `SOLANA_PRIVATE_KEY` using signature shares from the Lit Nodes (within the Lit Action's secure execution environment)
   2. Sign the provided `message`
   3. Return the message signature to the client

The [decryptKeyAndSignMessage.spec.ts](./test/decryptKeyAndSignMessage.spec.ts) test will `console.log` the returned signature, and will also verify the signature is correct.
