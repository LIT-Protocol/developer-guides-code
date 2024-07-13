import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";

export const DEFAULT_AUTHORIZED_ETH_ADDRESS =
  "0xA89543a7145C68E52a4D584f1ceb123605131211";

export const encryptString = async (
  toEncrypt: string = "The answer to the universe is 42.",
  authorizedEthAddress: string = DEFAULT_AUTHORIZED_ETH_ADDRESS
) => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Habanero,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Encoding and encrypting string...");
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
    console.log("✅ Encrypted string");

    console.log({ ciphertext, dataToEncryptHash });

    return { ciphertext, dataToEncryptHash };
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
