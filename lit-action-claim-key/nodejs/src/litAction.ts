// @ts-nocheck

const _litActionCode = () => {
  Lit.Actions.claimKey({ keyId: userId });
};

export const litActionCode = `(${_litActionCode.toString()})();`;
