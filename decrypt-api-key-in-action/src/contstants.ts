export const genActionSource = (url: string) => {
  return `(async () => {
    const apiKey = await Lit.Actions.decryptAndCombine({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig: null,
      chain: 'ethereum',
    });
    const resp = await fetch(${url}, {
      'Authorization': apiKey
    });
    let data = await resp.json();
    Lit.Actions.setResponse({ response: data });
  })();`;
}

