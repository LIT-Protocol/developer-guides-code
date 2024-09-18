// @ts-nocheck

const _litActionCode = async () => {
  try {
    const url = "https://api.weather.gov/gridpoints/TOP/31,80/forecast";
    const resp = await fetch(url).then((response) => response.json());
    const temp = resp.properties.periods[0].temperature;
    console.log("Current temperature from the API:", temp);

    if (temp < 60) {
      Lit.Actions.setResponse({ response: "It's too cold to sign the message!" });
      return;
    }

    const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
    Lit.Actions.setResponse({ response: sigShare });
  } catch (error) {
    Lit.Actions.setResponse({ response: error.message });
  }
};

export const litActionCode = `(${_litActionCode.toString()})();`;
