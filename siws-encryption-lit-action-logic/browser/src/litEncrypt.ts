import { getCurrentActionIpfsCidConditions, getLitNodeClient } from "./utils";
import litActionDecrypt from "./litActions/dist/litActionDecrypt.js?raw";

export const encryptStringToLitAction = async (stringToEncrypt: string) => {
  try {
    const litNodeClient = await getLitNodeClient();
    console.log("🔄 Encrypting data...");
    const accessControlConditions = await getCurrentActionIpfsCidConditions(
      litActionDecrypt
    );
    console.log("🔄 Access control conditions:", accessControlConditions);
    const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
      dataToEncrypt: new TextEncoder().encode(stringToEncrypt),
      accessControlConditions,
    });
    console.log("✅ Encrypted data");
    return { ciphertext, dataToEncryptHash };
  } catch (error) {
    console.error("Error in encryptStringForAddress:", error);
    throw error;
  }
};
