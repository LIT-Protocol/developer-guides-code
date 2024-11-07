// @ts-nocheck

const _litActionCode = async () => {
  try {
    const sigShare = await LitActions.signEcdsa({
      toSign,
      publicKey,
      sigName: "sig",
    });
    LitActions.setResponse({ response: sigShare });
  } catch (error) {
    LitActions.setResponse({ response: error.message });
  }
};

export const litActionCode = `(${_litActionCode.toString()})();`;