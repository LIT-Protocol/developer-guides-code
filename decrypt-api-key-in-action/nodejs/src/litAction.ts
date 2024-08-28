// @ts-nocheck

const _litActionCode = async () => {
  const apiKey = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    authSig: null,
    chain: "ethereum",
  });
  // Note: uncomment this functionality to use your api key that is for the provided url
  /*
    const resp = await fetch("${url}", {
        'Authorization': "Bearer " + apiKey
    });
    let data = await resp.json();
    */
  Lit.Actions.setResponse({ response: apiKey });
};

export const litActionCode = `(${_litActionCode.toString()})();`;
