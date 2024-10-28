import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { EvmContractConditions } from "@lit-protocol/types";
import { encryptFile } from "@lit-protocol/encryption";

const LIT_NETWORK = LitNetwork.DatilTest;

export const encryptFileWithContractConditions = async (
  toEncryptFileBlob: Blob,
  evmContractConditions: EvmContractConditions
) => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Encrypting file...");
    const { ciphertext, dataToEncryptHash } = await encryptFile(
      {
        file: toEncryptFileBlob,
        chain: "yellowstone",
        evmContractConditions,
      },
      litNodeClient
    );
    console.log("✅ Encrypted file");

    return { ciphertext, dataToEncryptHash };
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};