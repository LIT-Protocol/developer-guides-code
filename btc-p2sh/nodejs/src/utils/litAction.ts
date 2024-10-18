// @ts-nocheck

const _litActionCode = async () => {
  try {
    const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName: 'btcSignature' });
    Lit.Actions.setResponse({ response: 'true' });
  } catch (error) {
    Lit.Actions.setResponse({ response: error.message });
  }
};

export const litActionCode = `(${_litActionCode.toString()})();`;