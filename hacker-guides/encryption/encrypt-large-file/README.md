<!-- omit in toc -->
# Encrypting a Large File

As mentioned in the [Encrypting a File](../encrypt-file/README.md) guide, the Lit SDK has a maximum payload size limit of approximately `1.5MB` for encryption operations. Since the SDK currently doesn't support file chunking, attempting to encrypt files larger than this will result in out of memory errors.

This guide demonstrates how to securely encrypt and decrypt large files using a combination of symmetric encryption (AES-256-CBC) and Lit Protocol's decentralized access control.

- [Prerequisites](#prerequisites)
- [Running the Code Example](#running-the-code-example)
  - [Requirements](#requirements)
  - [Steps](#steps)
  - [Expected Output](#expected-output)
- [Understanding the Code](#understanding-the-code)
  - [Generate the Symmetric Encryption Key](#generate-the-symmetric-encryption-key)
  - [Reading and Encrypting the Large File](#reading-and-encrypting-the-large-file)
  - [Encrypting the Key Material with Lit Protocol](#encrypting-the-key-material-with-lit-protocol)
  - [Decrypting the Key Material](#decrypting-the-key-material)
  - [Decrypting the Large File](#decrypting-the-large-file)
- [Next Steps](#next-steps)

## Prerequisites

- Understanding of Lit core terminology and concepts covered [here](../README.md#core-terminology)
- Understanding of Lit encryption terminology and concepts covered [here](../README.md#relevant-terminology)
- Understanding of the [Connecting to the Lit Network](../connecting-to-lit/README.md) guide
- Understanding of the [Authenticating a Session](../../_getting-started/authenticating-a-session/README.md) guide
- Understanding of the [Encrypting a File](../encrypt-file/README.md) guide

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
2. The symmetric key and initialization vector were successfully encrypted
   - The `ciphertext` and `dataToEncryptHash` are logged to the terminal for demonstration purposes:

```bash
ℹ️  ciphertext: jD6Qe8tsWHkLcVr8MqSy/eHAyZcq3M+M+ZI8FPFa+PcpXTYZGx4H4lFJ3bhGQJtGjDXiPkylHvVLmD9EeB9y0kzfWMEnlvjESXWp23EqXkQxlszbJxtNrEywBo046QSyz14BAxWHKYgOHFFoWLCMlIjhZQZUeEwbtZ6XayIsvlzdYQI=
ℹ️  dataToEncryptHash: 55109cb2bd42b0fccfe4824c1f93953d2fd61ba769b4433dccb62eea6fed0df2
```

3. Session Signatures were successfully generated for the requested session
4. After the JavaScript test passes, you should see the path for the decrypted file logged to the terminal:
   - NOTE: The decrypted file is actually deleted after the test is complete, for cleanup and sanity purposes. You can disable this behavior by commenting out the `afterEach` function in the [./test/index.spec.ts](./test/index.spec.ts) file.
   - The test compares the decrypted file to the original file to ensure they are the same before deleting the decrypted file.

```bash
ℹ️  Decrypted content saved to: /Users/user/developer-guides-code/hacker-guides/encryption/encrypt-large-file/src/loremIpsum-decrypted.txt
```

## Understanding the Code

The following code from [./src/index.ts](./src/index.ts) does the following:

### Generate the Symmetric Encryption Key

```typescript
// Generate a random symmetric key and initialization vector
const symmetricKey = randomBytes(32); // 256 bits for AES-256
const initializationVector = randomBytes(16); // 16 bytes for AES
```

This code generates the two components for AES-256-CBC encryption:

1. `symmetricKey`:
   - A 32-byte (256-bit) random key used for both encryption and decryption
   - Uses AES-256 (Advanced Encryption Standard) which is a widely trusted symmetric encryption algorithm

2. `initializationVector`:
   - A 16-byte random value that adds randomness to the encryption process
   - Ensures that encrypting the same data multiple times produces different ciphertext outputs
   - Helps prevent pattern analysis and makes the encryption more secure

### Reading and Encrypting the Large File

The `encryptFile` helper function implements a memory-efficient streaming approach to encrypt large files:

1. **Setup**:
   - Creates input/output file streams
   - Initializes AES cipher with the provided key and IV
   - Sets up a 64KB buffer for chunked reading
2. **Streaming Process**:
   - Reads the input file in 64KB chunks
   - Encrypts each chunk using the cipher
   - Writes encrypted chunks to the output file
   - Continues until entire file is processed
3. **Cleanup**:
   - Finalizes encryption
   - Closes file streams
   - Returns path to encrypted file

The chunk streaming approach is required because it:

- Avoids loading entire file into memory
- Can handle files of any size
- Maintains constant memory usage regardless of file size

The output file will have the same name as the input with `.encrypted` appended (in the case of this example, `loremIpsum.txt.encrypted`).

### Encrypting the Key Material with Lit Protocol

After encrypting the large file with AES encryption, we need to securely store the encryption key and initialization vector. To do this, we:

1. Combine the symmetric key and IV into a single buffer
2. Encrypt this combined key material using Lit's `encrypt` method

```typescript
// Combine key and initializationVector for Lit encryption
const keyData = Buffer.concat([symmetricKey, initializationVector]);
const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
    dataToEncrypt: keyData,
    accessControlConditions,
});

console.log(`ℹ️  ciphertext: ${ciphertext}`);
console.log(`ℹ️  dataToEncryptHash: ${dataToEncryptHash}`);
```

Because we're utilizing Lit for the encryption of the key material, we still benefit from Lit's decryption Access Control Conditions. Only users meeting the specified conditions can decrypt the key material and access the decrypted file.

### Decrypting the Key Material

After generating the required Session Signatures, we make a request to the Lit Network to decrypt the key material:

```typescript
// Decrypt the symmetric key using Lit
const decryptionResponse = await litNodeClient.decrypt({
    chain: "ethereum",
    sessionSigs: sessionSignatures,
    ciphertext,
    dataToEncryptHash,
    accessControlConditions,
});

// Split the decrypted data back into key and initializationVector
const decryptedKeyData = Buffer.from(decryptionResponse.decryptedData);
const decryptedKey = decryptedKeyData.subarray(0, 32);
const decryptedIv = decryptedKeyData.subarray(32);
```

With the decrypted key and initialization vector, we can now decrypt the large file using AES-256-CBC.

### Decrypting the Large File

The `decryptFile` helper function implements a streaming approach to decrypt large files, mirroring the encryption process:

1. **Setup**:
   - Creates input/output file streams
   - Initializes AES decipher with the decrypted key and IV
   - Sets up a 64KB buffer for chunked reading

```typescript
const decipher = createDecipheriv(
  ENCRYPTION_ALGORITHM,
  key,
  initializationVector
);

const chunkSize = 64 * 1024; // 64KB chunks
const buffer = Buffer.alloc(chunkSize);
```

2. **Streaming Process**:
   - Reads the encrypted file in 64KB chunks
   - Decrypts each chunk using the decipher
   - Writes decrypted chunks to the output file
   - Continues until entire file is processed

```typescript
while (
  (bytesRead = (await readStream.read(buffer, 0, chunkSize)).bytesRead) > 0
) {
  const chunk = buffer.subarray(0, bytesRead);
  const decryptedChunk = decipher.update(chunk);
  await writeStream.write(decryptedChunk);
}
```

3. **Cleanup**:
   - Finalizes decryption
   - Closes file streams
   - Returns path to decrypted file

Finally, the decrypted file is written to the `src` directory with the name `loremIpsum-decrypted.txt`:

```typescript
// Decrypt the file using the decrypted symmetric key
const decryptedFilePath = await decryptFile(
    encryptedFilePath,
    decryptedKey,
    decryptedIv
);
console.log(`ℹ️  Decrypted content saved to: ${decryptedFilePath}`);
```

## Next Steps
