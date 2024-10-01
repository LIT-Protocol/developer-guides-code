// @ts-nocheck
import { getSiwsMessage, verifySiwsSignature } from "./common.ts";

async function checkIfAuthedSolPubKeyIsPermitted(solanaPublicKey) {
  const SIWS_AUTH_METHOD_TYPE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("Lit Developer Guide Solana SIWS Example")
  );
  const usersAuthMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(`siws:${solanaPublicKey}`)
  );

  return Lit.Actions.isPermittedAuthMethod({
    tokenId: pkpTokenId,
    authMethodType: SIWS_AUTH_METHOD_TYPE,
    userId: ethers.utils.arrayify(usersAuthMethodId),
  });
}

(async () => {
  const _siwsObject = JSON.parse(siwsObject);
  const siwsInput = _siwsObject.siwsInput;

  try {
    const isValid = await verifySiwsSignature(
      getSiwsMessage(siwsInput),
      _siwsObject.signature,
      siwsInput.address
    );

    if (!isValid) {
      console.log("Signature is invalid.");
      return LitActions.setResponse({
        response: JSON.stringify({
          success: false,
          message: "Signature is invalid.",
        }),
      });
    }

    console.log("Signature is valid.");
  } catch (error) {
    console.error("Error verifying signature:", error);
    LitActions.setResponse({
      response: JSON.stringify({
        success: false,
        message: "Error verifying signature.",
        error: error.toString(),
      }),
    });
  }

  try {
    const isPermitted = await checkIfAuthedSolPubKeyIsPermitted(
      siwsInput.address
    );

    if (isPermitted) {
      console.log("Solana public key is authorized to use this PKP");
      return Lit.Actions.setResponse({ response: "true" });
    }

    console.log("Solana public key is not authorized to use this PKP");
    return Lit.Actions.setResponse({
      response: "false",
      reason: "Solana public key is not authorized to use this PKP",
    });
  } catch (error) {
    console.error("Error checking if authed sol pub key is permitted:", error);
    return LitActions.setResponse({
      response: JSON.stringify({
        success: false,
        message: "Error checking if authed sol pub key is permitted.",
        error: error.toString(),
      }),
    });
  }
})();
