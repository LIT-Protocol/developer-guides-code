// @ts-nocheck

const _litActionCode = async () => {
  try {
    const url = "https://mempool.space/api/blocks/tip/height";
    const resp = await fetch(url).then((response) => response.json());

    if (Number(resp) % 2 === 0 ){
      Lit.Actions.setResponse({ response: "Block height is even! Don't sign!"});
      console.log("Current block height:", resp);
      return;
    }

    const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName: 'btcSignature' });
    Lit.Actions.setResponse({ response: 'true' });
  } catch (error) {
    Lit.Actions.setResponse({ response: error.message });
  }
};

export const litActionCode = `(${_litActionCode.toString()})();`;
