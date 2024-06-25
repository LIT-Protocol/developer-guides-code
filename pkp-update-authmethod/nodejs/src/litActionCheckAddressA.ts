// @ts-nocheck

export const litActionCheckAddressA = (async () => {
  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain: "ethereum",
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: "0xA89543a7145C68E52a4D584f1ceb123605131211",
      },
    },
  ];

  const testResult = await Lit.Actions.checkConditions({
    conditions: accessControlConditions,
    authSig,
    chain: "ethereum",
  });

  if (!testResult) {
    LitActions.setResponse({
      response: "Address is not authorized",
    });
    return;
  }

  LitActions.setResponse({
    response: "true",
  });
})();
