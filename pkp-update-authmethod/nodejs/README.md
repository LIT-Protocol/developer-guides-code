# Adding and Removing Auth Methods for a PKP When it Owns Itself

This code example does the following:

1. Mints a new PKP using the ENV `ETHEREUM_PRIVATE_KEY_A`
2. Adds the ENV `LIT_ACTION_CHECK_ADDRESS_A` as an Auth Method for the PKP
3. Verifies `LIT_ACTION_CHECK_ADDRESS_A` was added as an Auth Method
4. Transfers ownership of the PKP from `ETHEREUM_PRIVATE_KEY_A` to the PKP's ETH address
5. Gets PKP Session Signatures using the `LIT_ACTION_CHECK_ADDRESS_A` Lit Action for authorization
6. Transfers some ETH from `ETHEREUM_PRIVATE_KEY_A` to the PKP ETH address
   - This is required to pay for the transactions that will add ENV `LIT_ACTION_CHECK_ADDRESS_B` Lit Action as an Auth Method, and remove `LIT_ACTION_CHECK_ADDRESS_A` as an Auth Method for the PKP
   - Adding and removing Auth Methods is an onchain actions and requires gas payment
7. Connects a PKP Ethers wallet using the PKP Session Signatures from step 5 to the Lit network
8. Sends a transaction to add `LIT_ACTION_CHECK_ADDRESS_B` as a permitted Auth Method for the PKP
9. Verifies `LIT_ACTION_CHECK_ADDRESS_B` was added as an Auth Method
10. Gets PKP Session Signatures using the `LIT_ACTION_CHECK_ADDRESS_B` Lit Action for authorization
11. Connects a PKP Ethers wallet using the PKP Session Signatures from step 10 to the Lit network
12. Sends a transaction to remove `LIT_ACTION_CHECK_ADDRESS_A` as a permitted Auth Method for the PKP
13. Verifies `LIT_ACTION_CHECK_ADDRESS_A` is no longer a permitted Auth Method for the PKP

### Running this Example

1. `cp .env.example .env`
2. Fill in the ENVs
   - `ETHEREUM_PRIVATE_KEY_A` The corresponding address should hold Lit Test tokens on the Chronicle network. It will be used to pay for minting a PKP, adding Auth Methods, transferring PKP ownership, funding the PKP address to pay for adding and removing Auth Methods
     - You can obtain test tokens from the faucet [here](https://faucet.litprotocol.com/)
   - `ETHEREUM_PRIVATE_KEY_B` The corresponding address is used to generate an authentication signature to test `LIT_ACTION_CHECK_ADDRESS_B` Lit Action Auth Method. Is does not need to have any test tokens, and it will not be used to send transactions
   - `LIT_ACTION_CHECK_ADDRESS_A` This is the IPFS CID for [litActionCheckAddressA](./src/litActionCheckAddressA.ts). Update the address on `Line 12` to the corresponding address for `ETHEREUM_PRIVATE_KEY_A`. Then upload the Lit Action to IPFS and copy the CID for this ENV
   - `LIT_ACTION_CHECK_ADDRESS_B` This is the IPFS CID for [litActionCheckAddressB](./src/litActionCheckAddressB.ts). Update the address on `Line 12` to the corresponding address for `ETHEREUM_PRIVATE_KEY_B`. Then upload the Lit Action to IPFS and copy the CID for this ENV
3. Install dependencies with: `yarn`
4. Run the code example with: `yarn test`
   - The status of the code example will be logged to the console
   - If the test is successful, then all of the above happened without error
