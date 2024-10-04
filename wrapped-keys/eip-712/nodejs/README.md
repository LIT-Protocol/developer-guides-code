## Running the Example

1. `yarn`
2. `cp .env.example .env`
   - Fill in `ETHEREUM_PRIVATE_KEY` env with an account that has Lit test tokens on Yellowstone
3. `yarn test`

[test/index.spec.ts](./test/index.spec.ts) creates a EIP-712 message, serializes it, and then signs it using the Wrapped Keys SDK. However, when attempting to recover the address from the signed message, the address is not being recovered correctly because the `signTypedData` function is not being used within the Wrapped Key signing Lit Action. Instead `signMessage` is used which adds the following prefix to the message before signing: `0x19Ethereum Signed Message:\n${message.length}${message}`.
