# Lit Action Fetch Example

This code demonstrates executing a Lit Action to make a `fetch` request to an API, and use the response as a conditions for providing a PKP signature.

## Running the Examples

### Install the Dependencies

In this directory, `lit-action-using-fetch/nodejs`, run `yarn` to install the project dependencies.

### Setting Up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` there is the ENV:

- `ETHEREUM_PRIVATE_KEY` - **Required**
  - Must have Lit test tokens on the Chronicle Yellowstone blockchain
    - [Faucet for Chronicle Yellowstone](https://chronicle-yellowstone-faucet.getlit.dev/)
  - Will be used to mint PKPs and pay for Lit usage

### Running the Test

After the `.env` is configured, there is a NPM scripts in the `package.json` to run the test suite:

- `test` Runs the test
