// @ts-nocheck

const _litActionCode = async () => {
    try {
      const decryptedApiKey = await Lit.Actions.decryptToSingleNode({
        accessControlConditions: evmContractConditions,
        ciphertext,
        dataToEncryptHash,
        authSig: null,
        chain: 'sepolia',
      });
  
      if(decryptedApiKey) { // Since `decryptedApiKey` will be undefined for all except the one leader node it's a good practice to check it
        LitActions.setResponse({ response: decryptedApiKey });
      }
    } catch (error) {
      LitActions.setResponse({ response: error.message });
    }
  };
  
  export const litActionCode = `(${_litActionCode.toString()})();`;