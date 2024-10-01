import { SolRpcConditions } from "@lit-protocol/types";
import { disconnectWeb3 } from "@lit-protocol/auth-browser";

import {
  getLitNodeClient,
  getSessionSigs,
  mintPkpAndAddPermittedAuthMethods,
} from "./utils";
import { SiwsObject } from "./types";
import litActionDecrypt from "./litActions/dist/litActionDecrypt.js?raw";

export async function decryptData(
  siwsObject: SiwsObject,
  solRpcConditions: SolRpcConditions,
  ciphertext: string,
  dataToEncryptHash: string
) {
  const pkpInfo = await mintPkpAndAddPermittedAuthMethods(
    siwsObject.siwsInput.address
  );
  let litNodeClient = await getLitNodeClient();

  try {
    console.log("🔄 Decrypting data...");
    const response = await litNodeClient.executeJs({
      code: litActionDecrypt,
      sessionSigs: await getSessionSigs(pkpInfo, siwsObject),
      jsParams: {
        siwsObject: JSON.stringify(siwsObject),
        solRpcConditions,
        ciphertext,
        dataToEncryptHash,
      },
    });
    console.log("✅ Decrypted data");

    return response.response;
  } catch (error) {
    console.error("Error in decryptData:", error);
    throw error;
  } finally {
    disconnectWeb3();
    litNodeClient!.disconnect();
  }
}
