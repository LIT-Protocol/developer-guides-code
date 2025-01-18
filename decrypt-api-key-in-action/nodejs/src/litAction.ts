// @ts-nocheck

const _litActionCode = async () => {
  if (!decryptRequest) {
    return null;
  }

  console.log(decryptRequest);

  try {
    const decrypted = await Lit.Actions.decryptAndCombine({
      accessControlConditions: decryptRequest.accessControlConditions,
      ciphertext: decryptRequest.ciphertext,
      dataToEncryptHash: decryptRequest.dataToEncryptHash,
      authSig: null,
      chain: decryptRequest.chain,
    });
    Lit.Actions.setResponse({
      response: JSON.stringify({
        message: "Successfully decrypted data",
        decrypted,
        timestamp: Date.now().toString(),
      }),
    });
    return decrypted;
  } catch (err) {
    Lit.Actions.setResponse({
      response: JSON.stringify({
        message: `failed to decrypt data: ${err.message}`,
        timestamp: Date.now().toString(),
      }),
    });
    return err.message;
  }
};

export const litActionCode = `(${_litActionCode.toString()})();`;
