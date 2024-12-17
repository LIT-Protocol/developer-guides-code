# Simple PKPEthersWallet + Contract Interaction

## Environment Variables

**Note about PKPs:** The example will automatically use the first PKP token owned by your connected Ethereum wallet. Make sure to:
1. Mint a PKP at the [Lit Explorer](https://explorer.litprotocol.com/) if you don't have one
2. Fund the PKP's Ethereum address with `tstLPX` tokens from the [Chronicle Yellowstone faucet](https://chronicle-yellowstone-faucet.getlit.dev)

## Setup

1. Install dependencies

```bash
yarn
```

2. Compile contracts

```bash
yarn hardhat compile
```

3. Run the development server

```bash
yarn dev
```

## PKP Wallet Functionality

The `pkpWallet` function provides a complete workflow for PKP-based smart contract interactions:

### Setup & Authentication
- Connects to Lit Network
- Retrieves the first PKP token owned by the connected wallet

### Contract Management
- Checks for existing contract deployments in localStorage
- Verifies contract existence on chain
- Handles new contract deployments when needed
- Saves deployment details for persistence

### Message Operations
- Reads current messages from the contract
- Writes new messages using PKP wallet
- Manages transaction signing and confirmation

### Error Handling
- Manages network connection issues
- Handles failed deployments
- Cleans up invalid contract references
- Ensures proper network disconnection


