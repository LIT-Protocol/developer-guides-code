// @ts-nocheck

const _litActionCode = async () => {
    try {
      // test an access control condition
      const decryptedApiKey = await Lit.Actions.decryptToSingleNode({
      // const decryptedApiKey = await Lit.Actions.decryptAndCombine({ // Works with both these op-codes
        accessControlConditions: evmContractConditions,
        ciphertext,
        dataToEncryptHash,
        authSig: null,
        chain: 'yellowstone',
      });
  
      if(decryptedApiKey) { // Since `decryptedApiKey` will be undefined for all except the one leader node it's a good practice to check it
        LitActions.setResponse({ response: decryptedApiKey });
      }
    } catch (error) {
      LitActions.setResponse({ response: error.message });
    }
  };
  
  export const litActionCode = `(${_litActionCode.toString()})();`;