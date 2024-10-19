/**
 * The global ethers library (5.7.0) is available on Lit Action (Unbundled)
 * 
 * inject ./buffer.shim.js
 */
import { ethers } from "ethers";

(async () => {

  const res = await Lit.Actions.runOnce({
    waitForResponse: true,
    name: '001-ethers-private-key'
  }, async () => {
    const privateKey = ethers.Wallet.createRandom().privateKey;
    const rpcProvider = new ethers.providers.JsonRpcProvider("https://yellowstone-rpc.litprotocol.com");
    const wallet = new ethers.Wallet(privateKey, rpcProvider);

    return wallet.privateKey;
  });

  console.log("Hakuna Matata")

  Lit.Actions.setResponse({
    response: JSON.stringify({
      success: true,
      message: res,
    })
  });
})();
