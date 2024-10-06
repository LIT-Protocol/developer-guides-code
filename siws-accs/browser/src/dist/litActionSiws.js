// esbuild-shims.js
globalThis.process = {
  env: {}
};

// src/litActionSiws.ts
function getSiwsMessage(siwsInput) {
  let message = `${siwsInput.domain} wants you to sign in with your Solana account:
${siwsInput.address}`;
  if (siwsInput.statement) {
    message += `

${siwsInput.statement}`;
  }
  const fields = [];
  if (siwsInput.uri !== void 0)
    fields.push(`URI: ${siwsInput.uri}`);
  if (siwsInput.version !== void 0)
    fields.push(`Version: ${siwsInput.version}`);
  if (siwsInput.chainId !== void 0)
    fields.push(`Chain ID: ${siwsInput.chainId}`);
  if (siwsInput.nonce !== void 0)
    fields.push(`Nonce: ${siwsInput.nonce}`);
  if (siwsInput.issuedAt !== void 0)
    fields.push(`Issued At: ${siwsInput.issuedAt}`);
  if (siwsInput.expirationTime !== void 0)
    fields.push(`Expiration Time: ${siwsInput.expirationTime}`);
  if (siwsInput.notBefore !== void 0)
    fields.push(`Not Before: ${siwsInput.notBefore}`);
  if (siwsInput.requestId !== void 0)
    fields.push(`Request ID: ${siwsInput.requestId}`);
  if (siwsInput.resources !== void 0 && siwsInput.resources.length > 0) {
    fields.push("Resources:");
    for (const resource of siwsInput.resources) {
      fields.push(`- ${resource}`);
    }
  }
  if (fields.length > 0) {
    message += `

${fields.join("\n")}`;
  }
  return message;
}
async function verifySiwsSignature(message, signatureBase58, publicKeyBase58) {
  const messageBytes = new TextEncoder().encode(message);
  try {
    const signatureBytes = ethers.utils.base58.decode(signatureBase58);
    const publicKeyBytes = ethers.utils.base58.decode(publicKeyBase58);
    const publicKey = await crypto.subtle.importKey(
      "raw",
      publicKeyBytes,
      {
        name: "Ed25519",
        namedCurve: "Ed25519"
      },
      false,
      ["verify"]
    );
    const isValid = await crypto.subtle.verify(
      "Ed25519",
      publicKey,
      signatureBytes,
      messageBytes
    );
    return isValid;
  } catch (error) {
    console.error("Error in verifySiwsSignature:", error);
    throw error;
  }
}
(async () => {
  const _siwsObject = JSON.parse(siwsObject);
  const siwsInput = _siwsObject.siwsInput;
  const siwsMessage = getSiwsMessage(siwsInput);
  try {
    const isValid = await verifySiwsSignature(
      siwsMessage,
      _siwsObject.signature,
      siwsInput.address
    );
    if (!isValid) {
      console.log("Signature is invalid.");
      return LitActions.setResponse({
        response: JSON.stringify({
          success: false,
          message: "Signature is invalid."
        })
      });
    }
    console.log("Signature is valid.");
  } catch (error) {
    console.error("Error verifying signature:", error);
    LitActions.setResponse({
      response: JSON.stringify({
        success: false,
        message: "Error verifying signature.",
        error: error.toString()
      })
    });
  }
  try {
    const result = await LitActions.checkConditions({
      conditions: solRpcConditions,
      authSig: {
        sig: ethers.utils.hexlify(ethers.utils.base58.decode(_siwsObject.signature)).slice(2),
        derivedVia: "solana.signMessage",
        signedMessage: siwsMessage,
        address: siwsInput.address
      },
      chain: "solana"
    });
    return LitActions.setResponse({ response: String(result) });
  } catch (error) {
    console.error("Error checking if authed sol pub key is permitted:", error);
    return LitActions.setResponse({
      response: JSON.stringify({
        success: false,
        message: "Error checking if authed sol pub key is permitted.",
        error: error.toString()
      })
    });
  }
})();
