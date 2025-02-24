import { disconnectWeb3 } from "@lit-protocol/auth-browser";

import {
  //  calculateLitActionCodeCID,
  getLitNodeClient,
  getSessionSigs,
} from "./utils";
import { SiwsObject } from "./types";
import litActionDecrypt from "./litActions/dist/litActionDecrypt.js?raw";

export async function decryptData(
  siwsObject: SiwsObject,
  ciphertext: string,
  dataToEncryptHash: string
) {
  const litNodeClient = await getLitNodeClient();

  // for debugging if you can't decrypt - you can uncomment this to
  // see the action ipfs cid that we are executing and make sure it matches what you expect
  // const actionIpfsCid = await calculateLitActionCodeCID(litActionDecrypt);
  // console.log("🔄 Action IPFS CID that we are executing:", actionIpfsCid);

  try {
    console.log("🔄 Decrypting data...");
    const response = await litNodeClient.executeJs({
      code: litActionDecrypt,
      sessionSigs: await getSessionSigs(litNodeClient),
      jsParams: {
        siwsObject: JSON.stringify(siwsObject),
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
    // run these when you're totally done with the session.
    // commented out for now, because otherwise if you click "decrypt" twice it will
    // fail the second time because these connections are already disconnected.
    // disconnectWeb3();
    // litNodeClient.disconnect();
  }
}
