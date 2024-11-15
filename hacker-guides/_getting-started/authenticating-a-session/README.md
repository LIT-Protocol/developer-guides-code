<!-- omit in toc -->
# Authenticating a Session with Lit

In order to use your [Lit Resources and their corresponding abilities](../README.md#lit-resources-and-abilities), you need to authenticate yourself with the Lit Network. After your identity has been authenticated, the Lit nodes can then verify whether you have the necessary permissions to access a given Lit Resource and its associated abilities when you make requests to the Lit Network (such as decrypting data, signing transactions with a PKP, or executing a Lit Action).

As covered [here](../README.md#session-signatures) in the Getting Started `README`, Sessions are the means by which you authenticate with the Lit Network to interact with Lit Resources securely without repeatedly signing transactions with your wallet. This guide will walk you through the process of authenticating a session, which involves:

1. Generating a Session Key Pair
2. Creating an Authentication Signature to authorize your Session Key to use Lit Resources you have access to
3. Requesting the Lit network to generate Session Signatures for your Session, authorizing it to perform actions with the specified Lit Resources

<!-- omit in toc -->
## Table of Contents

- [Prerequisites](#prerequisites)
- [Running the Code Example](#running-the-code-example)
  - [Requirements](#requirements)
  - [Steps](#steps)
  - [Expected Output](#expected-output)
- [Understanding the Code](#understanding-the-code)
  - [Creating an Ethers Signer](#creating-an-ethers-signer)
  - [Requesting Session Signatures](#requesting-session-signatures)


## Prerequisites

- Understanding of Lit core terminology and concepts covered [here](../README.md#core-terminology)
- Understanding of the [Connecting to the Lit Network](../connecting-to-lit/README.md) guide

## Running the Code Example

### Requirements

- [Node.js](https://nodejs.org/en)
- [Yarn](https://yarnpkg.com/getting-started)
- `@lit-protocol/constants`
- `@lit-protocol/lit-node-client`
- `@lit-protocol/auth-helpers`

### Steps

1. `yarn` to install the dependencies
2. `yarn test` to run the code example

### Expected Output

After running the code example, you should see output in your terminal indicating that a connection to the Lit Network was successfully established, and that session signatures were successfully generated for the requested session:

```bash
[Lit-JS-SDK v6.11.0] [2024-11-15T05:58:06.815Z] [DEBUG] [core] signatures: {
  'https://15.235.83.220:7470': {
    sig: 'cadda38603f3cc62b83f043ede4fd758a9aee7363aa8c0b510658aa43d0e955942e63629029117f89973999956c4d2c20f666cc7af124661ebaeb1d4cf7bc00f',
    derivedVia: 'litSessionSignViaNacl',
    signedMessage: `{"sessionKey":"963d6551d36a8b5be53d8959d45141764dbfd3c00649f56bc00433ef09db75f5","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-control-condition-decryption"}],"capabilities":[{"sig":"0x3a18598d9dbcb4c3f588d3948803f34397790f6b3ea1620913e353a002fb5526032aad72400635419346ca91a9bcfcd36cbdfc5b0f5080ecc48ded6ccfe6da7b1b","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0xA89543a7145C68E52a4D584f1ceb123605131211\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption' for 'lit-accesscontrolcondition://*'.\\n\\nURI: lit:session:963d6551d36a8b5be53d8959d45141764dbfd3c00649f56bc00433ef09db75f5\\nVersion: 1\\nChain ID: 1\\nNonce: 0x23f22526f00d01dc505e291881a44a8c74664f76cdaa2662b8af1ae54c9b4725\\nIssued At: 2024-11-15T05:58:06.757Z\\nExpiration Time: 2024-11-15T06:08:06.728Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWFjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dfX0sInByZiI6W119","address":"0xA89543a7145C68E52a4D584f1ceb123605131211"}],"issuedAt":"2024-11-15T05:58:06.778Z","expiration":"2024-11-15T06:08:06.728Z","nodeAddress":"https://15.235.83.220:7470"}`,
    address: '963d6551d36a8b5be53d8959d45141764dbfd3c00649f56bc00433ef09db75f5',
    algo: 'ed25519'
  },
  'https://15.235.83.220:7472': {
    sig: 'fccb3a82b02f1f3c9ba66fc8b3a61b0404875baf95449c76727529970105b3d96a2de9869a6cefd7c510ee8ecc55d7345e2b469f30ae59511579c703d2ab3a0c',
    derivedVia: 'litSessionSignViaNacl',
    signedMessage: `{"sessionKey":"963d6551d36a8b5be53d8959d45141764dbfd3c00649f56bc00433ef09db75f5","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-control-condition-decryption"}],"capabilities":[{"sig":"0x3a18598d9dbcb4c3f588d3948803f34397790f6b3ea1620913e353a002fb5526032aad72400635419346ca91a9bcfcd36cbdfc5b0f5080ecc48ded6ccfe6da7b1b","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0xA89543a7145C68E52a4D584f1ceb123605131211\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption' for 'lit-accesscontrolcondition://*'.\\n\\nURI: lit:session:963d6551d36a8b5be53d8959d45141764dbfd3c00649f56bc00433ef09db75f5\\nVersion: 1\\nChain ID: 1\\nNonce: 0x23f22526f00d01dc505e291881a44a8c74664f76cdaa2662b8af1ae54c9b4725\\nIssued At: 2024-11-15T05:58:06.757Z\\nExpiration Time: 2024-11-15T06:08:06.728Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWFjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dfX0sInByZiI6W119","address":"0xA89543a7145C68E52a4D584f1ceb123605131211"}],"issuedAt":"2024-11-15T05:58:06.778Z","expiration":"2024-11-15T06:08:06.728Z","nodeAddress":"https://15.235.83.220:7472"}`,
    address: '963d6551d36a8b5be53d8959d45141764dbfd3c00649f56bc00433ef09db75f5',
    algo: 'ed25519'
  },
  'https://15.235.83.220:7471': {
    sig: 'b1e0d8fd8d09c3392b540126418ee9a8d8dbbabdd4d0c368832d612b1f51dadcd5f02bf5ca19dbd0251a3986ad5ddb514fc1f7e1753f8a6a979adf45fbbbd901',
    derivedVia: 'litSessionSignViaNacl',
    signedMessage: `{"sessionKey":"963d6551d36a8b5be53d8959d45141764dbfd3c00649f56bc00433ef09db75f5","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-control-condition-decryption"}],"capabilities":[{"sig":"0x3a18598d9dbcb4c3f588d3948803f34397790f6b3ea1620913e353a002fb5526032aad72400635419346ca91a9bcfcd36cbdfc5b0f5080ecc48ded6ccfe6da7b1b","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0xA89543a7145C68E52a4D584f1ceb123605131211\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption' for 'lit-accesscontrolcondition://*'.\\n\\nURI: lit:session:963d6551d36a8b5be53d8959d45141764dbfd3c00649f56bc00433ef09db75f5\\nVersion: 1\\nChain ID: 1\\nNonce: 0x23f22526f00d01dc505e291881a44a8c74664f76cdaa2662b8af1ae54c9b4725\\nIssued At: 2024-11-15T05:58:06.757Z\\nExpiration Time: 2024-11-15T06:08:06.728Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWFjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dfX0sInByZiI6W119","address":"0xA89543a7145C68E52a4D584f1ceb123605131211"}],"issuedAt":"2024-11-15T05:58:06.778Z","expiration":"2024-11-15T06:08:06.728Z","nodeAddress":"https://15.235.83.220:7471"}`,
    address: '963d6551d36a8b5be53d8959d45141764dbfd3c00649f56bc00433ef09db75f5',
    algo: 'ed25519'
  }
}
[Lit-JS-SDK v6.11.0] [2024-11-15T05:58:06.816Z] [DEBUG] [core] The request time is at: 2024-11-15T05:58:06.816Z
* Outer expiration:
    * Issued at: 2024-11-15T05:58:06.778Z
    * Expiration: 2024-11-15T06:08:06.728Z
    * Duration: 9 minutes, 59.950 seconds
    * Status: ✅ Not expired (valid for 9 minutes, 59.912 seconds)
* Capabilities:
    * Capability 1 (web3.eth.personal.sign):
        * Issued at: 2024-11-15T05:58:06.757Z
        * Expiration: 2024-11-15T06:08:06.728Z
        * Duration: 9 minutes, 59.971 seconds
        * Status: ✅ Not expired (valid for 9 minutes, 59.912 seconds)
        * Attenuation:
            * lit-accesscontrolcondition://*
              * Threshold/Decryption
```

## Understanding the Code

The following code from [./src/index.ts](./src/index.ts) does the following:

### Creating an Ethers Signer

```typescript
const ethersSigner = new ethers.Wallet(
  ETHEREUM_PRIVATE_KEY,
  new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);
```

The wallet that corresponds to `ETHEREUM_PRIVATE_KEY` would be your dev wallet that has permission to decrypt some data, sign with a PKP that it controls, or would be paying for the execution of a Lit Action (payment is not required for the Lit DatilDev network, so you don't need to worry about it for the hackathon).

As we'll cover further below, the `ethersSigner` is used to generate an Authentication Signature which is a [ERC-5573](https://eips.ethereum.org/EIPS/eip-5573) message that specifies what Lit Resources and corresponding abilities the Session will be authorized to use.

### Requesting Session Signatures

After connecting an instance of `LitNodeClient` to the Lit Network, the code calls the `getSessionSigs` method to request the Lit network to generate session signatures for the session.

This method takes in an object with the following properties:

- **chain**: Corresponds to the signature schema and message format you're requesting the session to be authenticated with. This should almost always be `ethereum`.
- **expiration**: The date and time at which the session will no longer be valid.
  - It's recommended that you set this value to be as soon as possible, to minimize the amount of time that the session is valid for in case it gets compromised.
- **resourceAbilityRequests**: An array of objects that specify the Lit Resources and abilities you're requesting the session to be authorized to use.
- **authNeededCallback**: A function that you implement that generates an Authentication Signature for the session.

As a result of executing `getSessionSigs`, the Lit SDK will generate the ephemeral session key pair, execute the `authNeededCallback` function to generate an Authentication Signature, and submit the request to the Lit Network to generate session signatures.

Upon receiving the request, each Lit node in the network will independently authenticate the Authentication Signature, deriving the corresponding Ethereum address, and use that address to check if it has the authority to delegate the specified Lit Resources and abilities to the session.

If a node determines that the Authentication Signature is valid and authorized to delegate the `resourceAbilityRequests` to the session, it will generate a Session Signature indicating that the session is authenticated and authorized to use the specified Lit Resources and abilities.

After a threshold of nodes have generated Session Signatures, the Lit Network will send the Session Signatures back to your client. You will then use these Session Signatures to interact with the Lit Network, as we'll cover in other code examples in this guide.
