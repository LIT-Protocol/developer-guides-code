export const litActionCode = `
(async () => {
  // test an access control condition
  const testResult = await Lit.Actions.checkConditions({
    conditions,
    authSig,
    chain,
  });

  if (!testResult) {
    LitActions.setResponse({ response: "address does not have 1 or more Wei on Ethereum Mainnet" });
    return
  }

  const sigShare = await LitActions.signEcdsa({
    toSign: dataToSign,
    publicKey,
    sigName: "sig",
  });
})();
`;
