<!-- omit in toc -->
# Encrypting a File

After connecting to the Lit Network and authenticating a session, you can encrypt a file using the Lit SDK's [encrypt](https://v6-api-doc-lit-js-sdk.vercel.app/classes/lit_node_client_src.LitNodeClientNodeJs.html#encrypt) method. This method takes in the file you want to encrypt, as well as an array of [Access Control Conditions (ACCs)](https://developer.litprotocol.com/docs/advanced-topics/access-control-conditions) that specify who is authorized to decrypt the data.

Encryption happens client side, as the instance of `LitNodeClient` you created has retrieved the public BLS key for the Lit Network you are connected to.

When you want to decrypt the file, you will submit the _encryption metadata_ (ciphertext, dataToEncryptHash, and access control conditions) and your Session Signatures to the Lit Network. Each Lit node will verify that you have the necessary permissions to decrypt the data (by parsing the access control conditions the data was encrypted with) and then generate their decryption shares if authorized. Once all the decryption shares are generated, they are returned back to the client where the Lit SDK will combine them and return the decrypted file.

- [Prerequisites](#prerequisites)
- [Running the Code Example](#running-the-code-example)
  - [Requirements](#requirements)
  - [Steps](#steps)
  - [Expected Output](#expected-output)
- [Understanding the Code](#understanding-the-code)
  - [Reading the Unencrypted File](#reading-the-unencrypted-file)
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
2. The file was successfully encrypted
   - The `dataToEncryptHash` is logged to the terminal for demonstration purposes (`ciphertext` was omitted for brevity):

```bash
ℹ️  dataToEncryptHash: 397acd6bbbf08a2f55da61e8ab552f787f3ad1cc8ccb82dac9fcb6ace26f7148
```

3. Session Signatures were successfully generated for the requested session
4. After the JavaScript test passes, you should see the path for the decrypted file logged to the terminal:
   - NOTE: The decrypted file is actually deleted after the test is complete, for cleanup and sanity purposes. You can disable this behavior by commenting out the `afterEach` function in the [./test/index.spec.ts](./test/index.spec.ts) file.
   - The test compares the decrypted file to the original file to ensure they are the same before deleting the decrypted file.

```bash
ℹ️  Decrypted content saved to: /Users/user/developer-guides-code/hacker-guides/encryption/encrypt-file/src/loremIpsum-decrypted.txt
```

## Understanding the Code

The following code from [./src/index.ts](./src/index.ts) does the following:

### Reading the Unencrypted File

First, we read the unencrypted file and store its contents in the `fileContent` variable:

```typescript
const filePath = join(process.cwd(), "src", "loremIpsum.txt");
const fileContent = await fs.readFile(filePath, "utf8");
```

When encrypting files with the Lit SDK, it's important to note that the entire file must be loaded into memory as a `Uint8Array` before encryption can begin.

The Lit SDK has a maximum payload size limit of approximately `1.5MB` for encryption operations. Since the SDK currently doesn't support file chunking, attempting to encrypt files larger than this will result in out of memory errors.

For larger files, consider using envelope encryption:

1. Encrypt the large file using a symmetric key (e.g. with AES encryption)
2. Use the Lit SDK to encrypt just the symmetric key itself

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
    dataToEncrypt: new TextEncoder().encode(fileContent),
    accessControlConditions,
});

console.log(`ℹ️  dataToEncryptHash: ${dataToEncryptHash}`);
```

`dataToEncrypt` takes a `Uint8Array` as an argument, so we need to convert the file's contents to a `Uint8Array` using `new TextEncoder().encode`.

The output of the `encrypt` method is the `ciphertext` and `dataToEncryptHash`. Coupled with the `accessControlConditions`, this forms the _encryption metadata_ that we'll need to submit to the Lit Network when we want to decrypt the data later.

### Requesting Session Signatures

Our request for session signatures is the same as covered in the [Authenticating a Session](../../_getting-started/authenticating-a-session/README.md#requesting-session-signatures) guide.

However, one thing to note is that the signer of the ERC-5573 message is identity the Lit nodes will use when performing the authorization check for our decryption request. In other words, the Ethereum address derived from the Authentication Signature is what will be checked against the `accessControlConditions` we defined earlier. This derived address **must** match what we specified as `returnValueTest.value` (in the case of this example, that's `await ethersSigner.getAddress()`).

### Decrypting the Data

Lastly, we call the `decrypt` method to decrypt the data. This method takes in the encryption metadata and your Session Signatures as arguments. Similar to when requesting Session Signatures, the `chain` argument signals the signature schema and message format that the Lit nodes will use to authenticate the decryption request (and should almost always be `ethereum`).

The decryption response is returned which is an object with the `Uint8Array` property: `decryptedData`. We can convert this back to a string by calling `new TextDecoder().decode` to get the decrypted data as a string.

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
```

Finally we write the decrypted data to a file:

```typescript
const outputPath = join(process.cwd(), "src", "loremIpsum-decrypted.txt");
await fs.writeFile(outputPath, decryptedString, "utf8");

console.log(`ℹ️  Decrypted content saved to: ${outputPath}`);
```

## Next Steps

- If the file you want to encrypt is larger than `1.5MB`, checkout the [Encrypting a Large File](./encrypt-large-file/README.md) guide.
