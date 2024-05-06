# Decrypt and Use an API Key Within a Lit Action

This example shows how you can encrypt an api key on the client with specific decrypt conditions, and then decrypt that api key from within a Lit Action to perform some remote api call with the key.

Before running, there are two variables to configure within `index.ts`:

```js
const url = `<your http endpoint for api-key usage>`;
const key = '<your api key>';
```