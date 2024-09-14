// @ts-nocheck

const _litActionCode = async () => {
  try {
    const apiKey = await Lit.Actions.decryptAndCombine({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig: null,
      chain: "ethereum",
    });

    const resp = await fetch(`${alchemyUrl}${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      }),
    });

    let data = await resp.json();

    if (data.result) {
      data.result = parseInt(data.result, 16);
    }

    Lit.Actions.setResponse({ response: JSON.stringify(data) });
  } catch (e) {
    Lit.Actions.setResponse({ response: e.message });
  }
};

export const litActionCode = `(${_litActionCode.toString()})();`;
