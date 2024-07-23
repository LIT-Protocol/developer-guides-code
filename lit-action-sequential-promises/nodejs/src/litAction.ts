// @ts-nocheck

const _litActionCode = async () => {
  const WEATHER_API_1_URL =
    "https://api.weather.gov/gridpoints/TOP/42,42/forecast";
  const WEATHER_API_2_URL =
    "https://api.open-meteo.com/v1/forecast?latitude=42&longitude=42&hourly=temperature_2m";

  const weather1Result = await fetch(WEATHER_API_1_URL).then((response) =>
    response.json()
  );
  const weather1Temp = weather1Result.properties.periods[0].temperature;
  const weather1TempCelsius = ((weather1Temp - 32) * 5) / 9;

  const weather2Result = await fetch(WEATHER_API_2_URL).then((response) =>
    response.json()
  );
  const weather2Temp = weather2Result.hourly.temperature_2m[0];

  const averageTemp = (weather1TempCelsius + weather2Temp) / 2;

  // only sign if the temperature is above 60F/15.5C. If it's below 60F/15.5C, exit.
  if (averageTemp < 15.5) {
    return;
  }

  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
};

export const litActionCode = `(${_litActionCode.toString()})();`;
