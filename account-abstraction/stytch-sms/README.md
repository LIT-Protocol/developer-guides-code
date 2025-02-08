# Stytch SMS OTP

The `@lit-protocol/lit-auth-client` package simplifies the implementation of OTP login in your web applications. It provides a `LitAuthClient` class, which you can use to initialize a provider for the supported OTP login methods.

For more information about customization options, refer to our API documentation. The [LitAuthClient](https://v6-api-doc-lit-js-sdk.vercel.app/classes/lit_auth_client_src.LitAuthClient.html) and [StytchOtpProvider](https://v6-api-doc-lit-js-sdk.vercel.app/classes/lit_auth_client_src.StytchOtpProvider.html) classes are most relevant for this guide.

## Code Example

This directory contains a code example demonstrating how to implement Stytch SMS OTP in your web application. This example:

1. Prompts the webpage user to enter their phone number.
2. Requests an SMS OTP from Stytch.
3. Prompts the webpage user to enter the code sent to their phone.
4. Authenticates with Stytch.
5. Connects to the Lit network.
6. Initializes the `LitAuthClient` and `StytchOtpProvider`.
7. Authenticates the user by calling the `authenticate()` method, which returns an `AuthMethod` object.

### Running the Example

This example requires a Stytch account and project. You can sign up for a free account [here](https://stytch.com/dashboard/create-account?redirect=%2Fdashboard%2F). Once you have an account, you can create a new project and obtain your `public token` and `project ID` from the [Stytch Dashboard](https://stytch.com/dashboard).


#### Install the Dependencies

In this directory, `account-abstraction/stytch-sms`, run `yarn` to install the project dependencies.

#### Setting up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` there is the ENV:

- `VITE_STYTCH_PUBLIC_TOKEN`: Your Stytch public token.
- `VITE_STYTCH_PROJECT_ID`: Your Stytch project ID.

#### Running the Example

You can run the example by first installing the dependencies with `yarn install` and then running `yarn dev` to start the Vite development server. The example will be available at `http://localhost:5173/`.

### Specific Files to Reference

- `src/litCode.ts`: Contains the main logic for Stytch SMS OTP, connecting to the Lit network, initializing the `LitAuthClient` and `StytchOtpProvider`, and authenticating the user.
- `src/utils.ts`: Contains a utility function for getting environment variables and ensuring they are set.

## Additional Notes

The Lit Relay Server allows you to mint Programmable Key Pairs (PKPs) without incurring gas fees. You can also use your own relay server or mint PKPs directly using Lit's contracts.

With the `AuthMethod` object, you can mint or fetch PKPs associated with the authenticated phone number. You can find these methods in the [StytchOtpProvider](https://v6-api-doc-lit-js-sdk.vercel.app/classes/lit_auth_client_src.StytchOtpProvider.html) API documentation.

If you are using the Lit Relay Server, you will need to request an API key [here](https://docs.google.com/forms/d/e/1FAIpQLSeVraHsp1evK_9j-8LpUBiEJWFn4G5VKjOWBmHFjxFRJZJdrg/viewform).