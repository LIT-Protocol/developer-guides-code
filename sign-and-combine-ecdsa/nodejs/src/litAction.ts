// @ts-nocheck

const _litActionCode = async () => {
  const signature = await Lit.Actions.signAndCombineEcdsa({
    toSign,
    publicKey,
    sigName,
  });

  const jsonSignature = JSON.parse(signature);
  jsonSignature.r = "0x" + jsonSignature.r.substring(2);
  jsonSignature.s = "0x" + jsonSignature.s;
  const hexSignature = ethers.utils.joinSignature(jsonSignature);

  const signedTx = ethers.utils.serializeTransaction(
    unsignedTransaction,
    hexSignature
  );

  const recoveredAddress = ethers.utils.recoverAddress(toSign, hexSignature);
  console.log("Recovered Address:", recoveredAddress);

  const response = await Lit.Actions.runOnce(
    { waitForResponse: true, name: "txnSender" },
    async () => {
      try {
        const rpcUrl = await Lit.Actions.getRpcUrl({ chain });
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const transactionReceipt = await provider.sendTransaction(signedTx);

        return `Transaction Sent Successfully. Transaction Hash: ${transactionReceipt.hash}`;
      } catch (error) {
        return `Error: When sending transaction: ${error.message}`;
      }
    }
  );

  Lit.Actions.setResponse({ response });
};

export const litActionCode = `(${_litActionCode.toString()})();`;
