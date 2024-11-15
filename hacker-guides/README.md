# Lit Protocol Hackathon Starter Guide

Welcome to the Lit Protocol Hackathon Starter Guide! This starter guide aims to simplify your onboarding process with the Lit Protocol, covering everything from installation to advanced functionalities like deploying Lit Actions and working with Programmable Key Pairs (PKPs).

The Lit Protocol is a decentralized key management network that enables encryption, decryption, signing with distributed keys, and decentralized serverless functions.

## Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Basic understanding of JavaScript/TypeScript

## How this Guide is Organized

This guide is organized into several directories, each focusing on a different aspect of the Lit Protocol. It's intended that you start with the Getting Started directory, and then you can jump around to different directories based on your project needs.

### Directories Overview

- [Getting Started](./_getting-started/README.md):
  - Overview of commonly used Lit terminology
  - Installing commonly used Lit packages
  - Connecting to a Lit Network with the Lit Node Client
  - Generating an authenticated session to enable interaction with a Lit Network
- [Encryption](./encryption/README.md)
  - Client-side encryption/decryption
  <!-- - Decryption within a Lit Action -->
  - Access Control Conditions for encryption
<!-- - [Decentralized Serverless Functions (Lit Actions)](./decentralized-serverless-functions/README.md)
  - Deploying a Lit Action to IPFS
  - Importing libraries into a Lit Action
- [Signing with decentralized keys (Programmable Key Pairs)](./signing/README.md)
  - Minting a Programmable Key Pair
  - Signing data with a Programmable Key Pair in a Lit Action -->

---

The following will have guides added soon, but here are some links to the relevant Lit documentation for these topics:

- [Programmable Key Pairs (PKPs)](https://developer.litprotocol.com/user-wallets/pkps/overview)
  - [Minting a PKP](https://developer.litprotocol.com/user-wallets/pkps/minting/via-contracts)
  - Mint a PKP and using it to sign EIP-191 messages [code example](https://github.com/LIT-Protocol/developer-guides-code/tree/master/eip-191-signing/nodejs)
- [Decentralized Serverless Compute (Lit Actions)](https://developer.litprotocol.com/sdk/serverless-signing/overview)
  - [Quick Start](https://developer.litprotocol.com/sdk/serverless-signing/quick-start) guide
  - How to [deploy a Lit Action](https://developer.litprotocol.com/sdk/serverless-signing/deploying)
  - How to use various [Lit functionalities](https://developer.litprotocol.com/category/advanced-topics-1) within a Lit Action
