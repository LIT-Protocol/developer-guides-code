# Connecting to a Lit Network

This directory contains a code example that demonstrates how to connect to a Lit Network using the Lit SDK's `LitNodeClient`.

The [code example](./src/index.ts) is written in TypeScript and uses the `LitNodeClient` to connect to the `DatilDev` network.

## Running the Code Example

### Requirements

- [Node.js](https://nodejs.org/en)
- [Yarn](https://yarnpkg.com/getting-started)
- `@lit-protocol/constants`
- `@lit-protocol/lit-node-client`

### Steps

1. `yarn` to install the dependencies
2. `yarn test` to run the code example

### Expected Output
After running the code example, you should see output in your terminal indicating that the `LitNodeClient` was successfully connected to the `DatilDev` network:

```bash
[Lit-JS-SDK v6.11.0] [2024-11-15T04:22:17.234Z] [DEBUG] [core] listening for state change on staking contract:  0xD4507CD392Af2c80919219d7896508728f6A623F
[Lit-JS-SDK v6.11.0] [2024-11-15T04:22:17.235Z] [DEBUG] [core] 🔥 lit is ready. "litNodeClient" variable is ready to use globally.
[Lit-JS-SDK v6.11.0] [2024-11-15T04:22:17.235Z] [DEBUG] [core] current network config {
  networkPubkey: '82b7ec4aac62a87aba55f6920862e021df37c445a075e72d87a64c3573aea67cfbb59a7be671e785fb3cb05d242cf2e6',
  networkPubKeySet: '82b7ec4aac62a87aba55f6920862e021df37c445a075e72d87a64c3573aea67cfbb59a7be671e785fb3cb05d242cf2e6',
  hdRootPubkeys: [
    '03ab0ccc2dc8a3d9c2de9a7421b171475a09e60cb546fe446a9d0c3aadb8f639ae',
    '03b6300abf338b504b7b49eb83b59554d12232b9f390f6bb5bf06150b812678b53',
    '039911489c48624554fef51f37323053953def50ed3b40e69620d0a6bcb4ffdc2f',
    '034feeda3a7912131c980ae8b6376611dd5052d574979247d64da8bb1446e240d7',
    '023dd81dba4b89da5e4c3dec5da93ba0e1addc0eafbe03487450c42e28628570d1',
    '0346ac7da954f1b8ee891b79eb8cf45bafef62c85dffc1dc41e4b755bc0428689f',
    '0222be55763b2339daf0c149e5e6e927894e0667671de47a591fc24f38eef48cd3',
    '0313cce430e8c79053e02460e880ec36f1d64763617b47e0a2f83d06caae86c27a',
    '023e4f4020ea03b0631b02cbb595631e6bbbd563f1fe9f1cf953b29ea8a2d26a85',
    '0332914fa7b8ca6083139bb969650c26b092fe9990ef188daada9e4049bef58899'
  ],
  subnetPubkey: '82b7ec4aac62a87aba55f6920862e021df37c445a075e72d87a64c3573aea67cfbb59a7be671e785fb3cb05d242cf2e6',
  latestBlockhash: '0x1e1a3f530ed757b6a61b0667396f7d71207b59b53893b1583e37e4476ed47ecb'
}
[Lit-JS-SDK v6.11.0] [2024-11-15T04:22:17.236Z] [DEBUG] [core] running cleanup for global modules
```

## Understanding the Code

The following code from [./src/index.ts](./src/index.ts) is what's responsible for connecting to the `DatilDev` network:

```typescript
litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
    debug: true,
});
await litNodeClient.connect();
```

The `litNetwork` option specifies which Lit Network to connect to. In this example, we're connecting to the `DatilDev` network, and is the network you should be using for the hackathon.

Setting the `debug` option to `true` will print additional information to the terminal about the connection process, and any errors that occur when processing your Lit network request.

To disconnect from the Lit Network, you can call the `disconnect()` method on the `LitNodeClient` instance:

```typescript
litNodeClient!.disconnect();
```

## Next Steps

Now that you've connected to the Lit Network, you can proceed to the next code example to learn how to [authenticate a session with Lit](../authenticating-a-session/README.md).