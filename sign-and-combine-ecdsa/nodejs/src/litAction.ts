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

  const recoveredAddress = ethers.utils.verifyMessage(toSign, hexSignature);
  console.log("Recovered Address:", recoveredAddress);

  //   try {
  //     const rpcUrl = await Lit.Actions.getRpcUrl({ chain });
  //     const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  //     const transactionResponse = await provider.sendTransaction(signedTx);
  //     const receipt = await transactionResponse.wait();

  //     Lit.Actions.setResponse({ response: JSON.stringify(receipt) });
  //   } catch (error) {
  //     const errorMessage = "Error: When sending transaction: " + error.message;
  //     Lit.Actions.setResponse({ response: errorMessage });
  //   }
};

export const litActionCode = `(${_litActionCode.toString()})();`;
