// @ts-nocheck
import { decodeBase58 } from "https://deno.land/std@0.224.0/encoding/base58.ts";

const LIT_PKP_PERMISSIONS_CONTRACT_ADDRESS =
  "0x213Db6E1446928E19588269bEF7dFc9187c4829A";
const SIWS_AUTH_METHOD_TYPE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("Lit Developer Guide Solana SIWS Example")
);
const IS_PERMITTED_AUTH_METHOD_INTERFACE = new ethers.utils.Interface([
  "function isPermittedAuthMethod(uint256 tokenId, uint256 authMethodType, bytes memory id) public view returns (bool)",
]);

function getSiwsMessage(siwsInput) {
  let message = `${siwsInput.domain} wants you to sign in with your Solana account:\n${siwsInput.address}`;

  if (siwsInput.statement) {
    message += `\n\n${siwsInput.statement}`;
  }

  const fields = [];

  if (siwsInput.uri !== undefined) fields.push(`URI: ${siwsInput.uri}`);
  if (siwsInput.version !== undefined)
    fields.push(`Version: ${siwsInput.version}`);
  if (siwsInput.chainId !== undefined)
    fields.push(`Chain ID: ${siwsInput.chainId}`);
  if (siwsInput.nonce !== undefined) fields.push(`Nonce: ${siwsInput.nonce}`);
  if (siwsInput.issuedAt !== undefined)
    fields.push(`Issued At: ${siwsInput.issuedAt}`);
  if (siwsInput.expirationTime !== undefined)
    fields.push(`Expiration Time: ${siwsInput.expirationTime}`);
  if (siwsInput.notBefore !== undefined)
    fields.push(`Not Before: ${siwsInput.notBefore}`);
  if (siwsInput.requestId !== undefined)
    fields.push(`Request ID: ${siwsInput.requestId}`);
  if (siwsInput.resources !== undefined && siwsInput.resources.length > 0) {
    fields.push("Resources:");
    for (const resource of siwsInput.resources) {
      fields.push(`- ${resource}`);
    }
  }

  if (fields.length > 0) {
    message += `\n\n${fields.join("\n")}`;
  }

  return message;
}

async function verifySiwsSignature(
  message: string,
  signatureBase58: string,
  publicKeyBase58: string
) {
  // Convert message to Uint8Array
  const messageBytes = new TextEncoder().encode(message);

  try {
    const signatureBytes = decodeBase58(signatureBase58);
    const publicKeyBytes = decodeBase58(publicKeyBase58);

    // Import the public key
    const publicKey = await crypto.subtle.importKey(
      "raw",
      publicKeyBytes,
      {
        name: "Ed25519",
        namedCurve: "Ed25519",
      },
      false,
      ["verify"]
    );

    // Verify the signature
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

async function checkIfAuthedSolPubKeyIsPermitted(solanaPublicKey) {
  const usersAuthMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(`siws:${solanaPublicKey}`)
  );
  const abiEncodedData = IS_PERMITTED_AUTH_METHOD_INTERFACE.encodeFunctionData(
    "isPermittedAuthMethod",
    [pkpTokenId, SIWS_AUTH_METHOD_TYPE, usersAuthMethodId]
  );
  const isPermittedTx = {
    to: LIT_PKP_PERMISSIONS_CONTRACT_ADDRESS,
    data: abiEncodedData,
  };
  const isPermitted = await Lit.Actions.callContract({
    chain: "yellowstone",
    txn: ethers.utils.serializeTransaction(isPermittedTx),
  });
  if (!isPermitted) {
    console.log("Solana public key is not authorized to use this PKP");
    return Lit.Actions.setResponse({
      response: "false",
      reason: "Solana public key is not authorized to use this PKP",
    });
  }

  console.log("Solana public key is authorized to use this PKP");
  return Lit.Actions.setResponse({ response: "true" });
}

(async () => {
  try {
    const _siwsObject = JSON.parse(siwsObject);
    const siwsInput = _siwsObject.siwsInput;
    const signature = _siwsObject.signature;
    const publicKeyBase58 = siwsInput.address;

    // Use the exact message that was signed
    const reconstructedMessage = getSiwsMessage(siwsInput);

    const isValid = await verifySiwsSignature(
      reconstructedMessage,
      signature,
      publicKeyBase58
    );

    if (isValid) {
      console.log("Signature is valid.");

      return await checkIfAuthedSolPubKeyIsPermitted(siwsInput.address);
    } else {
      console.log("Signature is invalid.");
      LitActions.setResponse({
        response: JSON.stringify({
          success: false,
          message: "Signature is invalid.",
        }),
      });
    }
  } catch (error) {
    console.error("Error verifying signature:", error);
    LitActions.setResponse({
      response: JSON.stringify({
        success: false,
        message: "Error verifying signature.",
        error: error.toString(),
        stack: error.stack || "No stack trace available",
      }),
    });
  }
})();
