import { LitNodeClient, encryptString } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import * as ethers from "ethers";

const LIT_NETWORK = LitNetwork.DatilTest;

export const encryptToString = async (toEncrypt: string) => {
  let litNodeClient: LitNodeClient;

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const ethersSigner = provider.getSigner();
    const address = await ethersSigner.getAddress();
    console.log("Connected account:", await ethersSigner.getAddress());

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Encoding and encrypting string...");
    const accessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: address,
        },
      },
    ];

    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        accessControlConditions,
        dataToEncrypt: toEncrypt,
      },
      litNodeClient
    );
    console.log("✅ Encrypted string");

    console.log({ ciphertext, dataToEncryptHash });
    return { ciphertext, dataToEncryptHash };
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
