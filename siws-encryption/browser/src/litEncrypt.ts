import { getLitNodeClient, getSolRpcConditions } from "./utils";
import litActionDecrypt from "./litActions/dist/litActionDecrypt.js?raw";

export const encryptStringForAddress = async (
  stringToEncrypt: string,
  addressToEncryptFor: string
) => {
  try {
    const litNodeClient = await getLitNodeClient();
    console.log("🔄 Encrypting data...");
    const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
      dataToEncrypt: new TextEncoder().encode(stringToEncrypt),
      solRpcConditions: await getSolRpcConditions(
        addressToEncryptFor,
        litActionDecrypt
      ),
    });
    console.log("✅ Encrypted data");
    return { ciphertext, dataToEncryptHash };
  } catch (error) {
    console.error("Error in encryptStringForAddress:", error);
    throw error;
  }
};
