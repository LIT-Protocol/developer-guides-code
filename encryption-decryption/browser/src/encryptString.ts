import { LitNodeClient, encryptToJson } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import * as ethers from "ethers";

const LIT_NETWORK = LitNetwork.DatilDev;

export const encryptToString = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const ethersSigner = provider.getSigner();
    const address = await ethersSigner.getAddress();
    console.log("Connected account:", address);

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
        chain: "base",
        method: "eth_getBalance",
        parameters: [":userAddress", "latest"],
        returnValueTest: {
          comparator: ">=",
          value: "0", // 0.000001 ETH
        },
      },
    ];

    const sampleString = "Hello, this is a test file content!";
    const toEncryptFileBuffer = new TextEncoder().encode(sampleString);
    const file = new Blob([toEncryptFileBuffer], { type: "text/plain" });

    const encryptedJson = await encryptToJson({
      accessControlConditions,
      chain: "base",
      litNodeClient,
      file,
    });
    console.log("✅ Encrypted string");

    console.log(encryptedJson);
    return encryptedJson;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
