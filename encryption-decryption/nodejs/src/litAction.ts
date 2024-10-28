// @ts-nocheck

const _litActionCode = async () => {
    try {
      // test an access control condition
      const decryptedApiKey = await Lit.Actions.decryptToSingleNode({
        accessControlConditions: evmContractConditions,
        ciphertext,
        dataToEncryptHash,
        authSig: null,
        chain: 'yellowstone',
      });
  
      LitNodeClient.Actions.setResponse({ response: decryptedApiKey });
    } catch (error) {
      LitActions.setResponse({ response: error.message });
    }
  };
  
  export const litActionCode = `(${_litActionCode.toString()})();`;