export const litActionCode = `
(async () => {
  // test an access control condition
  const testResult = await Lit.Actions.checkConditions({
    conditions,
    authSig,
    chain,
  });

  if (!testResult) return;

  const sigShare = await LitActions.signEcdsa({
    toSign: dataToSign,
    publicKey,
    sigName: "sig",
  });
})();
`;
