# Custom AuthMethods

If you'd like further customization than what Lit natively supports for AuthMethods, you can define your own. 

This scenario includes minting a PKP, adding a custom `AuthMethod` to it, and creating a custom LitAction for the verification process of the `AuthMethod`.

Next we'll describe the difference between authentication and authorization, and how Lit uses them.

## Authentication and Authorization

Authentication refers to confirming a user's identity. This involves resolving some kind of authentication material (i.e. JWT, AuthToken).

Authorization refers to the process of granting permission to a user to access a resource. In our case, the resource is a PKP.

When creating a custom `AuthMethod`, you are responsible for the authentication process. After the user owns a PKP, you should add the custom `AuthMethod` to the PKP only after verifying the user's identity. Past this, Lit will handle the authorization process on the Lit network through Session Signatures.

## Code Example

This directory contains a code example demonstrating how to implement Custom `AuthMethods` in your web application. This example:

1. Get an Ethereum signer from your browser wallet.
2. Connects to the Lit network (`LitNodeClient`) and `LitContracts`.
3. Requests your browser wallet to mint a PKP.
4. Defines a custom `AuthMethod`.
5. Adds the custom `AuthMethod` to the PKP.
6. Showcases methods for retrieving permitted `AuthMethods` and checking whether the custom `AuthMethod` is permitted for the PKP.
7. Adds a custom LitAction to the PKP for the verification process of the custom `AuthMethod`.
8. Generates Session Signatures for the PKP to interact with the Lit network, using the custom LitAction as authentication.
9. Signs a message with the PKP.

### Running the Example

You can run the example by first installing the dependencies with `yarn install` and then running `yarn dev` to start the Vite development server. The example will be available at `http://localhost:5173/`.

### Specific Files to Reference

- `src/litCode.ts`: Contains the main logic for minting a PKP, adding a custom `AuthMethod`, adding a custom LitAction, and generating Session Signatures.
- `src/litAction.ts`: Contains the custom LitAction code.
