// @ts-nocheck
(async () => {
  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain: "ethereum",
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: "0x600DC16993EA1AbdA674A20d432F93041cDa2ef4",
      },
    },
  ];

  const testResult = await Lit.Actions.checkConditions({
    conditions: accessControlConditions,
    authSig: JSON.parse(authSig),
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
