<!-- omit in toc -->
# Encrypting and Decrypting Data with Lit

Leveraging Lit's Multi-Party Computation (MPC) network, you can securely encrypt data using the network's public BLS (Boneh–Lynn–Shacham) key. The encryption process incorporates [Access Control Conditions (ACCs)](#access-control-conditions-accs) to specify who is authorized to decrypt the data. Only when a user meets these defined conditions will the Lit nodes generate their decryption shares, enabling the data to be decrypted securely and ensuring that access is granted exclusively to permitted parties.

<!-- omit in toc -->
## Table of Contents

- [Prerequisites](#prerequisites)
- [Relevant Terminology](#relevant-terminology)
  - [Access Control Conditions (ACCs)](#access-control-conditions-accs)
- [Next Steps](#next-steps)

## Prerequisites

- Understanding of Lit core terminology and concepts covered in the [Getting Started](../_getting-started/README.md#core-terminology) guide.
- Understanding of the [Connecting to the Lit Network](../_getting-started/connecting-to-lit/README.md) guide.
- Understanding of the [Authenticating a Session](../_getting-started/authenticating-a-session/README.md) guide.

## Relevant Terminology

This section extends the [Core Terminology](../_getting-started/README.md#core-terminology) to expand on the relevant terminology for encryption.

### Access Control Conditions (ACCs)

Rules that specify who can decrypt the encrypted data. ACCs can be based on blockchain conditions like wallet balances, token ownership, or custom smart contract logic.

For more information on how to define and use ACCs, refer to the [Access Control Conditions](https://developer.litprotocol.com/category/advanced-topics) docs.

## Next Steps

Now that you have an overview of encrypting data with Lit, you can continue on to the encryption guides:

- [Encrypting a String](./encrypt-string/README.md)
- [Encrypting a File](./encrypt-file/README.md)
