# Revoke Access to Encrypted Data

This code example demonstrates how access can be revoked to decrypt data using `EvmContractConditions` to making a request to an Access Control Contract.

## Running the Example

1. Install the dependencies with `yarn`
2. Copy the `.env.example` file to `.env` and set the environment variables
   - `ETHEREUM_PRIVATE_KEY` - The private key of the Ethereum account that will be used to:
     - Mint Lit Capacity Credits if one wasn't provided
     - Create the Lit Capacity Delegation Auth Sig
     - Create the Lit Auth Sig to generate the Session Signatures
   - `DEPLOYED_ACCESS_CONTROL_CONTRACT_ADDRESS` - The address of the deployed Access Control Contract
     - [The contract](../contracts/src/AccessControl.sol) has been deployed on the Lit Chronicle Yellowstone blockchain at: `0xf960775B87fF2f53Eb962A8845F647615047389E` for testing purposes
   - `LIT_CAPACITY_CREDIT_TOKEN_ID` - The ID of the Lit Capacity Credit Token to avoid minting a new one when the example is ran
3. Run the included tests using `yarn test`