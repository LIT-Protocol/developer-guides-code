// @ts-nocheck

const _litActionCode = async () => {
    try {
        const ethersProvider = new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl);
        const txValue = ethers.utils.hexlify(ethers.BigNumber.from(value));
        
        const unsignedTransaction = {
          to: recipientAddress,
          value: txValue,
          gasLimit: ethers.utils.hexlify(21000),
          gasPrice: (await ethersProvider.getGasPrice()).toHexString(),
          nonce: await ethersProvider.getTransactionCount(pkpEthAddress),
          chainId: chainInfo.chainId,
        };

        const toSign = ethers.utils.arrayify(ethers.utils.keccak256(
          ethers.utils.serializeTransaction(unsignedTransaction)
        ));

        const signature = await Lit.Actions.signAndCombineEcdsa({
          toSign,
          publicKey,
          sigName: "sig1",
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
        const response = await Lit.Actions.runOnce(
          { waitForResponse: true, name: "txnSender" },
          async () => {
            try {
              const rpcUrl = await Lit.Actions.getRpcUrl({ chain: "yellowstone" });
              const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
              const transactionReceipt = await provider.sendTransaction(signedTx);
              return transactionReceipt.hash;
            } catch (error) {
              throw error;
            }
          }
        );
        
        Lit.Actions.setResponse({ response });

    } catch (error) {
        throw error;
    }
};
  
export const litActionCode = `(${_litActionCode.toString()})();`;