# Running this Example

1. `yarn`
2. `yarn start`
3. Click the `Click Me` button
4. Connect your wallet
5. Sign a message to generate an AuthSig
6. Sign a second message to generate a SessionSig

# Bugs

- `@lit-protocol/lit-auth-client` has the missing dependencies:
  - `nanoid`
  - `@simplewebauthn/browser`
- After manually adding the above deps, running the code yielded:
  ```
  cbor.js:2 Uncaught TypeError: Cannot read properties of undefined (reading 'r')
      at cbor.js:2:159816
      at cbor.js:2:159897
      at cbor.js:2:159903
      at cbor.js:2:81
      at parcelRequire.../node_modules/cbor-web/dist/cbor.js (cbor.js:2:189)
      at newRequire (src.e31bb0bc.js:47:24)
      at localRequire (src.e31bb0bc.js:53:14)
      at parcelRequire.../node_modules/@lit-protocol/lit-auth-client/src/lib/utils.js.@lit-protocol/misc (utils.ts:3:1)
      at newRequire (src.e31bb0bc.js:47:24)
      at localRequire (src.e31bb0bc.js:53:14)
  ```
