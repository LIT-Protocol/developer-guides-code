# Decrypt and Use an API Key Within a Lit Action

This example shows how you can encrypt an api key on the client with specific decrypt conditions, and then decrypt that api key from within a Lit Action to perform some remote api call with the key.

Before running, there are two variables to configure within `index.ts`:

**Note: ts-node-esm requires NodeJS version 20**

```js
const url = `<your http endpoint for api-key usage>`;
const key = "<your api key>";
```

## Restricting your api key to only be used by a single Lit Action

Within the code you will see the below ACC condition:

```js
const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain,
    method: "eth_getBalance",
    parameters: [":userAddress", "latest"],
    returnValueTest: {
      comparator: ">=",
      value: "0",
    },
  },
];
```

You can change the above to the below to use the parameter: `:currentActionId` which will only allow a speific `IPFS ID` to decrypt the key which is explicitly asserted on in the condition `parameters`

```js
const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain,
    method: "eth_getBalance",
    parameters: [":currentActionId", "latest"],
    returnValueTest: {
      comparator: "==",
      value: "<your ipfs id>",
    },
  },
];
```

For easy upload of your Lit Action source code you can use the explorer [here](https://explorer.litprotocol.com/create-action)
