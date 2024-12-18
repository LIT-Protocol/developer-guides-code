declare global {
  const solRpcConditions: any;
  const ciphertext: any;
  const dataToEncryptHash: any;
}

// @ts-ignore
import { getSiwsMessage, verifySiwsSignature } from './common.ts';

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
      console.log('Signature is invalid.');
      return LitActions.setResponse({
        response: JSON.stringify({
          success: false,
          message: 'Signature is invalid.',
        }),
      });
    }

    console.log('Signature is valid.');
  } catch (error: any) {
    console.error('Error verifying signature:', error);
    return LitActions.setResponse({
      response: JSON.stringify({
        success: false,
        message: 'Error verifying signature.',
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
        sig: ethers.utils
          .hexlify(ethers.utils.base58.decode(_siwsObject.signature))
          .slice(2),
        derivedVia: 'solana.signMessage',
        signedMessage: siwsMessage,
        address: siwsInput.address,
      },
      chain: 'solana',
    });
    return LitActions.setResponse({ response: decryptedData });
  } catch (error: any) {
    console.error('Error decrypting data:', error);
    return LitActions.setResponse({
      response: JSON.stringify({
        success: false,
        message: 'Error decrypting data.',
        error: error.toString(),
      }),
    });
  }
})();
