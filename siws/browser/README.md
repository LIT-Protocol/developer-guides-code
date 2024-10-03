## Running the example

1. `yarn`
2. `cp .env.example .env`
   - Set `VITE_ETHEREUM_PRIVATE_KEY` with an account that has Lit test tokens on Yellowstone
3. `yarn build:lit-action`
4. `yarn dev`
5. Navigate to `http://localhost:5173/`
6. Open JavaScript console in browser
7. Connect a Solana wallet using the [Phatom wallet extension](https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=en)
   - Can be a brand new Solana wallet, doesn't need to have any funds
8. Connect wallet to the app
9. Click "Sign In"
10. Enter something in the encrypt input and click "Encrypt Data"
11. Click "Decrypt Data"

The first en/decrypt should be successful, but refreshing the page (don't clear browser cache) will result in an error because the Session Sig from the previous request is used.

If you uncomment `disconnectWeb3()` on `Line 42` in `litDecrypt.ts`, the second en/decrypt will be successful because the Session Sigs cache is cleared after the decryption request is made.