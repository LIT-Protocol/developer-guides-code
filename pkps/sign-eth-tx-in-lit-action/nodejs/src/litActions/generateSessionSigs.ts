// @ts-nocheck

const _litActionCode = () => {
  LitActions.setResponse({ response: "true" });
};

export const generateSessionSigs = `(${_litActionCode.toString()})();`;
