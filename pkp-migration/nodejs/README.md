# PKP Migration Tool

Because each Lit network starts with a new round of Distributed Key Generation (DKG), the network's root BLS key is different for each network. This means PKPs minted on one network **will not** be available to use on another - you will have to migrate each PKP.

This migration tools aims to alleviate some of the friction around migrating PKPs between Lit networks. It simply takes an array of existing PKP public keys on the source Lit network, loops over them to fetch their configured Auth Methods and Scopes, then mints new PKPs on the target Lit network with the same Auth Methods and Scopes.

It's important to not though that the new PKPs on the target Lit network will have new Ethereum addresses. Whatever is tied to the existing PKP Ethereum addresses, such as assets or account abstraction wallets that have the address as an authorized signer, will need to be manually migrated to the new PKP Ethereum address.

## How to Use this Script

### Install the Dependencies

In this directory, `pkp-migration/nodejs`, run `yarn` to install the project dependencies.

### Setting Up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```bash
cp .env.example .env
```

Within the `.env` there are the ENVs:

- `ETHEREUM_PRIVATE_KEY` - **Required** The corresponding Ethereum address needs to have Lit tokens on the `LIT_TO_NETWORK` (i.e. target Lit network) as it will be used to mint the new PKPs.
- `LIT_FROM_NETWORK` - **Required** This is the source Lit network that the PKP currently exist on (i.e. the network you're migrating from).
- `LIT_TO_NETWORK` - **Required** This is the target Lit network that the new PKP will be minted on (i.e. the network you're migrating to).
- `ADD_PKP_ETH_ADDRESS_AS_PERMITTED_ADDRESS` - **Required, defaulted to `false`** This flag determines whether or not each newly minted PKP has it's corresponding Ethereum address added as a permitted address to use the PKP
- `SEND_PKP_TO_ITSELF` - **Required, defaulted to `false`** This flag determines whether or not the underling NFT for each new PKP is sent to it's corresponding Ethereum address (the original owner of each newly minted PKP is the corresponding Ethereum address for `ETHEREUM_PRIVATE_KEY`).

### Running the Script

The `package.json` has two NPM scripts:

- `start` This will run the script [runMigration.ts](./src/runMigration.ts) and will attempt to migrate PKPs
  - Before running this script, make sure the `.env` is setup and you've specified all the PKP public keys you'd like to migrate from `LIT_FROM_NETWORK` to `LIT_TO_NETWORK`. This is done by adding each existing PKP's public key to the `PKPS_TO_MIGRATE` array in [runMigration.ts](./src/runMigration.ts).
  - Additionally, you can change the value for the `NEW_PKPS_FILE_PATH` variable. This is the file path to save all the metadata for the newly generated PKPs.
    - This file will have an object where the keys are the existing PKP's public key and the value is the metadata for the newly minted PKP on `LIT_TO_NETWORK`. These objects will looks like:
    ```json
    {
      "049e33d210d800b80eb8117bdde0bd307036379753b52bc8eefe0d1e305ece011d16c4ba561013c47c0269c5eff572cdcc87872852620315442dfb5455135057d6": {
        "newPkp": "0x04d4d0e8bde6e6da6d7dfccdbded83b2acf62377194d00053ce89c20713224c69605518cc64c204dac3a13c8d1de5b56f42abc5f6736d5aeeafdd584b0de3b46e6",
        "txHash": "0xbcbceb4f312899ded5a8a8e912df2e0326504048fa148004cd818377d2f26d44",
        "newPkpTokenId": "0x4a14dc714ec19993b3caa0f0a35d10d04bc00c335a1603bc1040a984a6f57576",
        "newPkpEthAddress": "0xf9Db60cEA498f8257fbac7403956E1DcB870319A",
        "oldPkpEthAddress": "0x94B023025BdA9f4Eda8F4b1f94077B2239AA6ace",
        "oldPkpTokenId": "0x4efa2254411daeb27d3d09480502391de2163492812c4ad0a21f7d37b149e576"
      }
    }
    ```
- `test` This will run a test that uses the `ETHEREUM_PRIVATE_KEY` from `.env` to mint new PKPs and test whether they can be migrated to `LIT_TO_NETWORK`. It then parses the outputted metadata file to verify the details.
