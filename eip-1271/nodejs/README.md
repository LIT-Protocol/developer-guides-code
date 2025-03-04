# Producing PKP Session Sigs Using EIP-1271

This code example demonstrates how to implement custom authentication and authorization using a [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271) smart contract. The end result is a PKP that can only be used to sign data if you have a valid EIP-1271 signature.

## How it Works

A detailed swimlane diagram that covers each step of this code example is available [here](https://swimlanes.io/u/hcSBVvQKk).

The following is a brief overview of how it works:

1. The Example Script computes the IPFS CID for the EIP-1271 Auth Lit Action code ([litAction.ts](./src/litAction.ts))
2. It then mints a new PKP, adding the IPFS CID of the EIP-1271 Auth Lit Action code as a permitted [Auth Method](https://developer.litprotocol.com/user-wallets/pkps/advanced-topics/auth-methods/overview), and sets the PKP to own itself
   - This results in the EIP-1271 Auth Lit Action being the only available method to produce signatures using the PKP.
3. Mints a Lit [Capacity Credit](https://developer.litprotocol.com/paying-for-lit/capacity-credits) (if one wasn't provided)
4. Creates two `ethers.js` signers using the `ANVIL_PRIVATE_KEY_1` and `ANVIL_PRIVATE_KEY_2` ENVs
   - We'll refer to them as `wallet1` and `wallet2`
5. Computes the `keccak256` hash of an example `string` that will be used as the signed data for the [WhitelistEIP1271 contract](../contracts/src/WhitelistEIP1271.sol)
6. Checks if `wallet1` and `wallet2` has sufficient funds to call the `WhitelistEIP1271` contract, funding them using the wallet derived from the `ETHEREUM_PRIVATE_KEY` ENV
7. Signs the `keccak256` hash of the example `string` using `wallet1`, and creates, signs, and sends a transaction executing the `signTx` method on the `WhitelistEIP1271` contract
8. Signs the `keccak256` hash of the example `string` using `wallet2`, and creates, signs, and sends a transaction executing the `signTx` method on the `WhitelistEIP1271` contract
   - Because the `WhitelistEIP1271` contract was deployed with a signature threshold of `2`, after two signatures from whitelisted addresses are provided, the EIP-1271 function `isValidSignature` will return the magic value (`0x1626ba7e`) signalling the signature as valid.
9. Calls `litNodeClient.createCapacityDelegationAuthSig` to generate a `capacityDelegationAuthSig` to pay for the execution of `litNodeClient.getPkpSessionSigs`
10. Calls `litNodeClient.getPkpSessionSigs` to generate Session Sigs using the previously minted PKP
    - This steps provides the EIP-1271 Auth Lit Action code ([litAction.ts](./src/litAction.ts)) as a [code string](https://developer.litprotocol.com/sdk/serverless-signing/deploying#deploying-using-a-code-string), and when the Lit nodes receive the request to generate their Session Sig shares, they will:
      1. Compute the IPFS CID for the given Lit Action code string
      2. Request the permitted Auth Methods for the PKP from the Chronicle Yellowstone Blockchain
      3. Verify the IPFS CID is one of the permitted Auth Methods for the PKP
      4. Execute the given Lit Action code
         - The Lit Action will:
           - Call the `isValidSignature` method on the `WhitelistEIP1271` contract to check if the provided EIP-1271 signature is valid
           - If valid, returns true signalling the Lit node to generate it's Session Signature share

## How to Run the Example

### Step 1: Clone the Code Example

Clone the Developer Guides Code repo using:

```
git clone https://github.com/LIT-Protocol/developer-guides-code.git
```

You'll want to `cd` into the code example directory:

```
cd eip-1271
```

Here you will see two directories:

1. `contracts` This is a [Foundry](https://github.com/foundry-rs/foundry) project for the `WhitelistEIP1271` contract
2. `nodejs` This is the directory for the code example

### Step 2: Deploy the `WhitelistEIP1271` Contract

If you don't already have Foundry installed, you can do so by following [this](https://book.getfoundry.sh/getting-started/installation) guide.

Now `cd` into the `contracts` directory:

```
cd contracts
```

And install the project using:

```
forge install
```

Because the Lit nodes will make an RPC call to a blockchain to call the `isValidSignature` on the `WhitelistEIP1271` contract when running the Lit Action, and they don't have access to your `localhost`, we must deploy the `WhitelistEIP1271` to a public blockchain like the Lit Chronicle Yellowstone blockchain.

To deploy the contract to Chronicle Yellowstone, you'll need Lit test tokens. If you don't have any, you can request some using a [faucet](https://chronicle-yellowstone-faucet.getlit.dev/).

Deploy the contract to Chronicle Yellowstone using:

```
PRIVATE_KEY=YOUR_PRIVATE_KEY forge script script/WhitelistEIP1271.s.sol:DeployWhitelistEIP1271 --rpc-url https://yellowstone-rpc.litprotocol.com/ --broadcast
```

This will compile and deploy the contract running the [WhitelistEIP1271.s.sol](../contracts/script/WhitelistEIP1271.s.sol) script. As part of this script, the signature threshold will be set to `2`, and two addresses will be whitelisted as permitted signers. These two addresses are the first to accounts that Anvil (a tool for running an Ethereum dev chain) generates:

- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
  - Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
  - Private key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

Make note of the contract address for your deployed instance of `WhitelistEIP1271`, you should see it in the output from the above command:

```
WhitelistEIP1271 deployed at: 0x54a772813Df0E75f20A0984f31D1400991eD6a33
```

### Step 3: Setup the Code Example

`cd` into the `nodejs` directory:

```
cd ../nodejs
```

Install the dependencies using `yarn`:

```
yarn
```

Copy the `.env.example` to a `.env` file:

```
cp .env.example .env
```

Fill in the ENVs:

- `ETHEREUM_PRIVATE_KEY` **Required** This wallet is going to be used to interact with the Lit Network, and will be paying (using Lit test tokens) for:
  - Minting a PKP
  - Minting a Lit Capacity Credit
  - Funding the EIP-1271 multisig wallets (if they have insufficient funds)
- `LIT_CAPACITY_CREDIT_TOKEN_ID` **Optional** This is the token ID for a Lit Capacity Credit. If you don't have one you can leave this empty, and one will be minted for you when you run the example script
- `ANVIL_PRIVATE_KEY_1` **Required** This is the first whitelisted wallet that will produce one part of the multisig
  - This private key can be changed, but you'll need to deploy a new instance of the `WhitelistEIP1271` and update it's [deployment script](../contracts/script/WhitelistEIP1271.s.sol) to use the address for whatever private key you use
- `ANVIL_PRIVATE_KEY_2` **Required** This is the second whitelisted wallet that will produce one part of the multisig
  - This private key can be changed, but you'll need to deploy a new instance of the `WhitelistEIP1271` and update it's [deployment script](../contracts/script/WhitelistEIP1271.s.sol) to use the address for whatever private key you use
- `DEPLOYED_EIP1271_WHITELIST_CONTRACT` **Required** This is the address for the deployed `WhitelistEIP1271` contract. Get this value from the output of deployment script in Step 2

### Step 4: Run the Code Example

Run the code example using:

```
yarn test
```

This will run the code example and assert the PKP Session Signatures are returned as expected.

<details>
  <summary>Click here for example success output</summary>
  
    ```
    Custom Auth EIP-1271 Example
    🔄 Connecting LitContracts client to network...
    ✅ Connected LitContracts client to network
    🔄 Getting PKP mint cost...
    ✅ Got PKP mint cost
    🔄 Calculating the IPFS CID for Lit Action code string...
    ✅ Calculated IPFS CID: QmXxa8g3drbiVt7TjNd3fHCLaxibSsKsw2wDvTEgezLc7q. Hexlified version: 0x12208eeceab8ea4eb8fdaab879480a2f5e506ed8232edaf32099a956a7e765e42f60
    🔄 Minting new PKP...
    0x12208eeceab8ea4eb8fdaab879480a2f5e506ed8232edaf32099a956a7e765e42f60
    ✅ Minted new PKP
    ℹ️ PKP Public Key: 0x0493e16f06e66ae65590eb75bbf5347b8f9d9ef581a84656940665138b880e658c5748b9a037b9c48376499cb27688d96ce00f0c42612c2d51c63df9bda7fc7264
    ℹ️ PKP Token ID: 32648469153176479107175864390735886403766786629081862000386207966264629795885
    ℹ️ PKP ETH Address: 0x7C365588C7FD2c4C73272DE2C1Ce926f26A61621
    🔄 Connecting LitNodeClient to Lit network...
    [Lit-JS-SDK v6.4.0] [2024-08-23T05:12:01.716Z] [DEBUG] [contract-sdk] Validator's URL: https://167.114.17.201:443
    ✅ Connected LitNodeClient to Lit network
    🔄 Minting Capacity Credits NFT...
    ✅ Minted new Capacity Credit with ID: 3782
    🔄 Checking balance for Wallet 1: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266...
    ✅ Wallet 1 has a sufficient balance
    🔄 Checking balance for Wallet 2: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8...
    ✅ Wallet 2 has a sufficient balance
    🔄 Signing message with EIP-1271 Wallet #1...
    ✅ Signed message with EIP-1271 Wallet #1. Transaction hash: 0x2483bdebffa869093b45b6a76d37e9620fa484b6d4df7753602a8b688793e2cb
    🔄 Signing message with EIP-1271 Wallet #2...
    ✅ Signed message with EIP-1271 Wallet #2. Transaction hash: 0x51482fad285cb69ab26b45c4d77d0bdd40cfc79077b84c39435f187ffc6804d2
    🔄 Getting combined signature for signed message...
    ✅ Got combined message signature
    🔄 Creating capacityDelegationAuthSig...
    ✅ Created the capacityDelegationAuthSig
    🔄 Getting the Session Sigs for the PKP using Lit Action: QmXxa8g3drbiVt7TjNd3fHCLaxibSsKsw2wDvTEgezLc7q...
    Storage key "lit-session-key" is missing. Not a problem. Contiune...
    Storage key "lit-wallet-sig" is missing. Not a problem. Continue...
    Unable to store walletSig in local storage. Not a problem. Continue...
    ✅ Got PKP Session Sigs
        ✔ should return PKP Session Sigs (12813ms)

    1 passing (13s)

    ✨ Done in 14.38s.

    ```

</details>

## Exploring the Code

If you'd like to dive deeper into the code to understand how this example works, below is a brief explanation of some of the files you'll want to look at:

- [WhitelistEIP1271.sol](../contracts/src/WhitelistEIP1271.sol) is the EIP-1271 example implementation
  - This contract's `constructor` that a list of addresses that will be whitelisted as signers, and a threshold of how many whitelisted signers needs to sign a hash for the contract to consider a signature is valid
  - The `signTx` function is how whitelisted addresses provide their signature of the hash to the contract
    - It:
      - Calls `ecrecover` on the signature
      - Verifies the signature is not invalid, and an address was recovered
      - Verifies the recovered address is on the contract's whitelist
      - Updates the contract's mapping of `hashes -> signatures`, storing the validated signature
  - The `isValidSignature` function loops over a given multisig signature, counting how many signatures were made by whitelisted addresses. If the number of whitelisted signers meets or exceeds the threshold set in the contract `constructor`, then the function returns the EIP-1271 magic value (`0x1626ba7e`) signaling the signature as valid
- [index.ts](./src/index.ts) contains the logic for example
- [litAction.ts](./src/litAction.ts) contains the logic for the EIP-1271 Auth Lit Action
- [index.spec.ts](./test/index.spec.ts) contains the test code that runs the example, and asserts the generated PKP Session Sigs are as expected
