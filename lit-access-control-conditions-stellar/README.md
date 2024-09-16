# Running this Code Example

## Prerequisites

You'll need to have the contract address for a deployed instance of the [allow-list contract](./stellar-contracts/contracts/allow-list/src/lib.rs). Additionally, the `init` function on the contract should be called with the Stellar account you'd like to use as the admin of the contract (being an admin allows adding new address to the allow list).

### Deploying the Contract to Stellar Testnet

1. Follow [this setup guide](https://developers.stellar.org/docs/smart-contracts/getting-started/setup#install-the-target) to setup the `soroban` CLI
2. Configure an identity to submit transaction to the testnet:
   ```
   soroban keys generate --global alice --network testnet
   ```
3. Compile the smart contract:
   ```
   soroban contract build
   ```
4. Deploy the contract
   ```
    soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/allow_list.wasm \
    --source alice \
    --network testnet
   ```
   The output of this command will be the smart contract address we use to submit transactions to, make sure to copy it and save it for later (you're going to need to paste it in our [litAction.js](./nodejs/src/litAction.js) for the `ALLOW_LIST_CONTRACT_ADDRESS` `const`):
   ```
   CBNUWSEPUI6DTKT7IYANIOYVFPWNVGELAUJY4HE4NQSEWW3I25BKWP6M
   ```

### Initializing the Contract

You should call the `init` function the contract to set the admin for the contract:

```
soroban contract invoke \
  --id CBNUWSEPUI6DTKT7IYANIOYVFPWNVGELAUJY4HE4NQSEWW3I25BKWP6M \
  --source alice \
  --network testnet \
  -- \
  init \
  --admin GCPQNAWI7DZ2OXVFP5ZWD7224HOOJVL6WRIMMEJ6PGS3ABMHFWC6ER6I
```

The address passed as the `--admin` parameter will be the only addressed allow to add other address to the allow list.

### Verifying `admin` was Added to the Allow List

You can call the `is_allowed` function to verify the admin address we just initialized the contract with is in fact on the allow list:

```
soroban contract invoke \
  --id CBNUWSEPUI6DTKT7IYANIOYVFPWNVGELAUJY4HE4NQSEWW3I25BKWP6M \
  --source alice \
  --network testnet \
  -- \
  id_allowed \
  --address GCPQNAWI7DZ2OXVFP5ZWD7224HOOJVL6WRIMMEJ6PGS3ABMHFWC6ER6I
```

## Running the Code

Now that we have a Stellar smart contract deployed and initialized, follow these steps to run the code example:

1. `cd` into the `nodejs` directory
2. Install the project dependencies with `yarn`
3. `cp .env.example .env` and fill in the required ENVs:
   ```
    STELLAR_SECRET=
    STELLAR_ACCOUNT_SEQUENCE_NUMBER=0
    ETHEREUM_PRIVATE_KEY=
    LIT_ACTION_IPFS_CID=
    LIT_PKP_PUBLIC_KEY=
   ```
4. In order to set the `LIT_ACTION_IPFS_CID` ENV, we'll need to build our Lit Action code and upload it to IPFS. To build it, run `yarn build:lit-action`. Then you can upload the resulting file found under `dist/litAction.js` to IPFS and get the CID
   - Before doing this, remember to replace the value for `ALLOW_LIST_CONTRACT_ADDRESS` in [litAction.js](./nodejs/src/litAction.js) to the address of the contract you deployed and initialized with your admin address
5. Finally, run `yarn start` to execute the code found in [index.js](./nodejs/src/index.ts)
