// import { Keypair } from "npm:@solana/web3.js";

import * as SolanaWeb3 from "https://esm.sh/@solana/web3.js@latest/lib/index.browser.esm.js";

(async () => {
  const solanaPrivateKey = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    chain: "ethereum",
    ciphertext,
    dataToEncryptHash,
    authSig: null,
    sessionSigs,
  });
  console.log("solanaPrivateKey: ", solanaPrivateKey);

  const solanaKeyPair = SolanaWeb3.Keypair.fromSecretKey(solanaPrivateKey);
  console.log("Wallet address: ", solanaKeyPair.publicKey.toString());
})();
