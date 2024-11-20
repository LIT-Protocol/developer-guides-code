export const litActionCode = `
(async () => {
  const resp = await fetch(url).then((response) => response.json());
  // console.log("resp: ", resp);
  const temperature = resp.properties.periods[0].temperature;

  // add any other data you want to include in the signature here
  // like the user's identity, or a nonce
  const messageToSign = { temperature, url };
  const toSign = ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(messageToSign))));

  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await Lit.Actions.signEcdsa({ toSign, publicKey, sigName });
  Lit.Actions.setResponse({response: JSON.stringify({messageSigned: messageToSign})});
})();
`;
