# Google OAuth

The `@lit-protocol/lit-auth-client` package simplifies the implementation of social login in your web applications. It provides a `LitAuthClient` class, which you can use to initialize a provider for each supported social login method.

By default, Lit's social login providers use Lit's OAuth project. If you prefer to use your own OAuth project, you can pass a callback to the `signIn()` method to modify the URL as needed.

For more information about customization options, refer to our API documentation. The [LitAuthClient](https://v6-api-doc-lit-js-sdk.vercel.app/classes/lit_auth_client_src.LitAuthClient.html) and [GoogleProvider](https://v6-api-doc-lit-js-sdk.vercel.app/classes/lit_auth_client_src.GoogleProvider.html) classes are most relevant for this guide.

## Code Example

This directory contains a code example demonstrating how to implement Google OAuth in your web application. This example:

1. Connects to the Lit network.
2. Initializes the `LitAuthClient` and `GoogleProvider`.
3. Checks if the user is already authenticated with Google.
4. If not, it calls the `signIn()` method to begin the authentication flow.
5. Authenticates the user by calling the `authenticate()` method, which returns an `AuthMethod` object.

### Running the Example

You can run the example by first installing the dependencies with `yarn install` and then running `yarn dev` to start the Vite development server. The example will be available at `http://localhost:5173/`.

### Specific Files to Reference

- `src/litCode.ts`: Contains the main logic for connecting to the Lit network, initializing the `LitAuthClient` and `GoogleProvider`, and authenticating the user.

## Additional Notes

The Lit Relay Server allows you to mint Programmable Key Pairs (PKPs) without incurring gas fees. You can also use your own relay server or mint PKPs directly using Lit's contracts.

With the `AuthMethod` object, you can mint or fetch PKPs associated with the authenticated Google account. You can find these methods in the [GoogleProvider](https://v6-api-doc-lit-js-sdk.vercel.app/classes/lit_auth_client_src.GoogleProvider.html) API documentation.

If you are using the Lit Relay Server, you will need to request an API key [here](https://docs.google.com/forms/d/e/1FAIpQLSeVraHsp1evK_9j-8LpUBiEJWFn4G5VKjOWBmHFjxFRJZJdrg/viewform).