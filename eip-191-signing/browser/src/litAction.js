export const litActionCode = `
(async () => {
  const sigShare = await LitActions.signEcdsa({
    toSign: dataToSign,
    publicKey,
    sigName,
  });
})();
`;
