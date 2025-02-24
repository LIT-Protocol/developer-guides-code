// @ts-nocheck
import { getSiwsMessage, verifySiwsSignature } from "./common.ts";

(async () => {
  const _siwsObject = JSON.parse(siwsObject);
  const siwsInput = _siwsObject.siwsInput;

  let signatureIsValid = false;
  let siwsMessage;

  try {
    siwsMessage = getSiwsMessage(siwsInput);

    signatureIsValid = await verifySiwsSignature(
      siwsMessage,
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
    // check whatever conditions you want, using JS
    // to set the userIsPermitted variable to true or false
    // and then return early if the conditions are not met
    const userIsPermitted = true;
    if (!userIsPermitted) {
      LitActions.setResponse({
        response: JSON.stringify({
          success: false,
          message: "User is not permitted.",
        }),
      });
      return;
    }
    const currentActionIpfsCid = Lit.Auth.actionIpfsIds[0];
    const currentIpfsCidAccessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":currentActionIpfsId"],
        returnValueTest: {
          comparator: "=",
          value: currentActionIpfsCid,
        },
      },
    ];

    const decryptedData = await Lit.Actions.decryptAndCombine({
      accessControlConditions: currentIpfsCidAccessControlConditions,
      ciphertext,
      dataToEncryptHash,
      chain: "ethereum",
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
