import { getLitNodeClient, getSolRpcConditions } from "./utils";
import litActionCodeSiws from "./litActions/dist/litActionSiws.js?raw";

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
        litActionCodeSiws
      ),
    });
    console.log("✅ Encrypted data");
    return { ciphertext, dataToEncryptHash };
  } catch (error) {
    console.error("Error in encryptStringForAddress:", error);
    throw error;
  }
};
