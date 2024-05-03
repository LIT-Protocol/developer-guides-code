export const litActionCode = `
const go = async () => {
  // test an access control condition
  // const testResult = await Lit.Actions.checkConditions({conditions, sessionSigs, chain})

  // only sign if the access condition is true
  // if (!testResult){
  //   return;
  // }

  const message = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode('Hello world'))
  );
  // this is the string "Hello World" for testing, hashed with sha-256 above.
  const toSign = message;
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey: "0x02e5896d70c1bc4b4844458748fe0f936c7919d7968341e391fb6d82c258192e64", sigName: "sig1" });
};

go();
`;
