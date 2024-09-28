// @ts-nocheck
import { decodeBase58 } from "https://deno.land/std@0.224.0/encoding/base58.ts";

import { getSiwsMessage, verifySiwsSignature } from "./common.ts";

(async () => {
  let signatureIsValid = false;

  try {
    const _siwsObject = JSON.parse(siwsObject);
    const siwsInput = _siwsObject.siwsInput;

    signatureIsValid = await verifySiwsSignature(
      getSiwsMessage(siwsInput),
      _siwsObject.signature,
      siwsInput.address
    );

    if (!signatureIsValid) {
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
    return LitActions.setResponse({
      response: JSON.stringify({
        success: false,
        message: "Error verifying signature.",
        error: error.toString(),
      }),
    });
  }

  try {
    const decryptedData = await Lit.Actions.decryptAndCombine({
      accessControlConditions: solRpcConditions,
      ciphertext,
      dataToEncryptHash,
      authSig: {
        sig: ethers.utils.hexlify(decodeBase58(signature)).slice(2),
        derivedVia: "solana.signMessage",
        signedMessage: reconstructedMessage,
        address: publicKeyBase58,
      },
      chain: "solana",
    });
    return LitActions.setResponse({ response: decryptedData });
  } catch (error) {
    console.error("Error decrypting data:", error);
    return LitActions.setResponse({
      response: JSON.stringify({
        success: false,
        message: "Error decrypting data.",
        error: error.toString(),
      }),
    });
  }
})();
