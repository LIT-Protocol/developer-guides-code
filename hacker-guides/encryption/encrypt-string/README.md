# Encrypting a String

After connecting to the Lit Network and authenticating a session, you can encrypt a string using the Lit SDK's [encrypt](https://v6-api-doc-lit-js-sdk.vercel.app/classes/lit_node_client_src.LitNodeClientNodeJs.html#encrypt) method. This method takes in the string, as an array of bytes, you want to encrypt, as well as an array of [Access Control Conditions (ACCs)](https://developer.litprotocol.com/docs/advanced-topics/access-control-conditions) that specify who is authorized to decrypt the data.

Encryption happens client side, as the instance of `LitNodeClient` you created has retrieved the public BLS key for the Lit Network you are connected to.

When you want to decrypt the string, you will submit the _encryption metadata_ (ciphertext, dataToEncryptHash, and access control conditions) and your Session Signatures to the Lit Network. Each Lit node will verify that you have the necessary permissions to decrypt the data (by parsing the access control conditions the data was encrypted with) and then generate their decryption shares if authorized. Once all the decryption shares are generated, they are returned back to the client where the Lit SDK will combine them and return the decrypted string.

- [Encrypting a String](#encrypting-a-string)
  - [Prerequisites](#prerequisites)
  - [Running the Code Example](#running-the-code-example)
    - [Requirements](#requirements)
    - [Steps](#steps)
    - [Expected Output](#expected-output)
  - [Understanding the Code](#understanding-the-code)
    - [Creating an Ethers signer](#creating-an-ethers-signer)
    - [Defining the Access Control Conditions](#defining-the-access-control-conditions)
    - [Encrypting the Data](#encrypting-the-data)
    - [Requesting Session Signatures](#requesting-session-signatures)
    - [Decrypting the Data](#decrypting-the-data)
  - [Next Steps](#next-steps)

## Prerequisites

- Understanding of Lit core terminology and concepts covered [here](../README.md#core-terminology)
- Understanding of Lit encryption terminology and concepts covered [here](../README.md#relevant-terminology)
- Understanding of the [Connecting to the Lit Network](../connecting-to-lit/README.md) guide
- Understanding of the [Authenticating a Session](../../_getting-started/authenticating-a-session/README.md) guide

## Running the Code Example

### Requirements

- [Node.js](https://nodejs.org/en)
- [Yarn](https://yarnpkg.com/getting-started)
- `@lit-protocol/constants`
- `@lit-protocol/lit-node-client`
- `@lit-protocol/auth-helpers`
- `@lit-protocol/types`

### Steps

1. `yarn` to install the dependencies
2. `yarn test` to run the code example

### Expected Output

After running the code example, you should see output in your terminal:

1. An indication that a connection to the Lit Network was successfully established
2. The string was successfully encrypted
   - The `ciphertext` and `dataToEncryptHash` are logged to the terminal for demonstration purposes:

```bash
ℹ️  ciphertext: mRLJXD7wAMsvBoq9Gb60bn+ofuZ0srzdU/cEkSvagDvwCr3X5l1tUNuHUXgTrLGbiv/iT7o7qtJ73pFQwRmjpmH4bQ2klUGEvdgTUElrHtQ4SSfSrqYY5tciNjmIip7ifS7oNnHMArK2vuld6ZVqW8VnonSNyVdefaxckYLAovxdVrssUi7U2okC
ℹ️  dataToEncryptHashh: 5ad8f16e45a2f21c693ea4e9376e46424abbf8f74838a5bd8f6173c54ba2e87a
```

3. Session Signatures were successfully generated for the requested session
4. After the JavaScript test passes, you should see the decrypted string logged to the terminal:

```bash
ℹ️  decryptedString: The answer to life, the universe, and everything is 42.
```

## Understanding the Code

The following code from [./src/index.ts](./src/index.ts) does the following:

### Creating an Ethers signer

As covered in the [Authenticating a Session](../../_getting-started/authenticating-a-session/README.md#creating-an-ethers-signer) guide, the `ethersSigner` is used to generate an Authentication Signature which is a [ERC-5573](https://eips.ethereum.org/EIPS/eip-5573) message that specifies what Lit Resources and corresponding abilities the Session will be authorized to use.

### Defining the Access Control Conditions

The following are the Access Control Conditions that we are using as part of the encryption process. They specify that the data can only be decrypted by the Ethereum address that corresponds to the `ethersSigner` we created earlier:

```typescript
const accessControlConditions: AccessControlConditions = [
    {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
            comparator: "=",
            value: await ethersSigner.getAddress(),
        },
    },
];
```

These conditions are what you'll want to customize based on your project's use case. You can learn more about the different types of conditions available [here](https://developer.litprotocol.com/category/advanced-topics).

### Encrypting the Data

The following code is what actually encrypts the data using the Lit SDK and the Lit network's public BLS key:

```typescript
const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
    dataToEncrypt: new TextEncoder().encode(
        "The answer to life, the universe, and everything is 42."
    ),
    accessControlConditions,
});

console.log(`ℹ️  ciphertext: ${ciphertext}`);
console.log(`ℹ️  dataToEncryptHashh: ${dataToEncryptHash}`);
```

`dataToEncrypt` takes a `Uint8Array` as an argument, so we need to convert the string to a `Uint8Array` using `new TextEncoder().encode`.

The output of the `encrypt` method is the `ciphertext` and `dataToEncryptHash`. Coupled with the `accessControlConditions`, this forms the _encryption metadata_ that we'll need to submit to the Lit Network when we want to decrypt the data later.

### Requesting Session Signatures

Our request for session signatures is the same as covered in the [Authenticating a Session](../../_getting-started/authenticating-a-session/README.md#requesting-session-signatures) guide.

However, one thing to note is that the signer of the ERC-5573 message is identity the Lit nodes will use when performing the authorization check for our decryption request. In other words, the Ethereum address derived from the Authentication Signature is what will be checked against the `accessControlConditions` we defined earlier. This derived address **must** match what we specified as `returnValueTest.value` (in the case of this example, that's `await ethersSigner.getAddress()`).

### Decrypting the Data

Lastly, we call the `decrypt` method to decrypt the data. This method takes in the encryption metadata and your Session Signatures as arguments. Similar to when requesting Session Signatures, the `chain` argument signals the signature schema and message format that the Lit nodes will use to authenticate the decryption request (and should almost always be `ethereum`).

Finally the decryption response is returned which is an object with the `Uint8Array` property: `decryptedData`. We can convert this back to a string by calling `new TextDecoder().decode` to get our decrypted string.

```typescript
const decryptionResponse = await litNodeClient.decrypt({
    chain: "ethereum",
    sessionSigs: sessionSignatures,
    ciphertext,
    dataToEncryptHash,
    accessControlConditions,
});

const decryptedString = new TextDecoder().decode(
    decryptionResponse.decryptedData
);
console.log(`ℹ️  decryptedString: ${decryptedString}`);
```

## Next Steps
