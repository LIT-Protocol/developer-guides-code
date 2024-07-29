# Lit Action Solana Tx Confirmation Timeout

## Running the Examples

### Install the Dependencies

In this directory, `la-sign-and-send-sol-tx/nodejs`, run `yarn` to install the project dependencies.

### Setting Up the `.env` File

Make a copy of the provided `.env.example` file and name it `.env`:

```
cp .env.example .env
```

Within the `.env` there are the ENVs:

1. `ETHEREUM_PRIVATE_KEY` - **Required**
   - Must have Lit test tokens on the Chronicle Yellowstone blockchain
     - [Faucet for Chronicle Yellowstone](https://chronicle-yellowstone-faucet.getlit.dev/)
   - Will be used to pay for Lit usage
2. `SOLANA_PRIVATE_KEY` - **Required**
   - Must have SOL on the Solana Devnet
     - [Faucet for Solana Devnet](https://faucet.solana.com/)
   - Will be used to send `0.01` SOL tx

### Run the Test

After filling out the `.env` file, run `yarn test` to run the test. You will get a Lit Action timeout error, however, if you review the Lit node logs you'll see that code execution completes before the request times out.

Here's an example log output for request `lit_baa0d493d6464`

```
DEBUG 2024-07-29T22:32:18.181237Z { "resp":"Ok(ExecuteJsResponse { union: Some(Print(PrintRequest { message: \"Lit Action completed\\n\" })) })", "correlation_id":"lit_baa0d493d6464", "lit_sdk_version":"6.3.0" }

INFO 2024-07-29T22:32:18.181747Z { "return":"Ok(())", "correlation_id":"lit_baa0d493d6464", "node":"15.235.83.220:7472" }
```

and then after the above, the timeout error:

```
ERROR 2024-07-29T22:32:47.335914Z { "error":"status: DeadlineExceeded, message: \"Your function exceeded the maximum runtime of 30000ms and was terminated.\", details: [], metadata: MetadataMap { headers: {} }", "correlation_id":"lit_baa0d493d6464", "node":"15.235.83.220:7470" }
```
