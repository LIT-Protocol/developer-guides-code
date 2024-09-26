# Triggering a Bitcoin (P2PKH) Transaction with Lit Protocol

This example was made to compile the code found in the blog post [here](spark.litprotocol.com/triggering-a-bitcoin-p2pkh-transaction-with-lit-protocol).

Please visit the blog post for more information.

## Prerequisites
Before compiling and trying this example out, there are a few things you'll need to prepare.
1. You will need to mint a PKP. The fastest way to do this is through the [Lit Explorer](https://explorer.litprotocol.com/). Please make sure you mint the PKP on the same network you run the example on.
2. An Ethereum wallet. Please make sure that this wallet was used to mint the PKP, and therefore has ownership of it.
3. The PKP must have a UTXO. Without a UTXO, the PKP will be unable to send any Bitcoin and this example will fail. Visit the blog post for more information.

Once the prerequisites of the blog post are met, you can run the code by running the following commands:

Install dependencies:
```yarn```

Run the code:
```yarn test```