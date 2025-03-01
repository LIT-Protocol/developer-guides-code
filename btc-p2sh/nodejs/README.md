# Bitcoin (P2SH) Transactions with Lit Protocol

These examples demonstrate how to use Lit Protocol PKPs (Programmable Key Pairs) to execute Bitcoin (P2SH) transactions.

## Prerequisites
Before compiling and trying this example out, there are a few things you'll need to prepare.
1. You will need to mint a PKP. The fastest way to do this is through the [Lit Explorer](https://explorer.litprotocol.com/). Please make sure you mint the PKP on the same network you run the example on.
2. An Ethereum wallet. Please make sure that this wallet was used to mint the PKP, and therefore has ownership of it.
3. The Bitcoin address derived from the PKP(s) must have a UTXO. Without a UTXO, the PKP will be unable to send any Bitcoin and this example will fail. Visit the [docs](https://developer.litprotocol.com/user-wallets/pkps/bitcoin/overview) for more information.
4. Choose one of the four P2SH examples to run. This can be done at the bottom of the `executeBtcSigning` function in `src/index.ts`. Just uncomment the function you want to run.

## Running the Example

Once the prerequisites are met, you can run the code by running the following commands:

Install dependencies:
```yarn```

Run the code:
```yarn test```
