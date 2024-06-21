import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";

export const encryptString = async (
  toEncrypt: string,
  authorizedEthAddress: string
) => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Cayenne,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("Connected to Lit network");

    console.log("Encoding and encrypting string...");
    const encoder = new TextEncoder();
    const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
      accessControlConditions: [
        {
          contractAddress: "",
          standardContractType: "",
          chain: "ethereum",
          method: "",
          parameters: [":userAddress"],
          returnValueTest: {
            comparator: "=",
            value: authorizedEthAddress,
          },
        },
      ],
      dataToEncrypt: encoder.encode(toEncrypt),
    });
    console.log("Encrypted string");

    return { ciphertext, dataToEncryptHash };
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
