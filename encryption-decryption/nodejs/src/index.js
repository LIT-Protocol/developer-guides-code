import { LitNodeClientNodeJs } from "@lit-protocol/lit-node-client-nodejs";
import { LitNetwork } from "@lit-protocol/constants";

(async () => {
  let litNodeClient;

  try {
    litNodeClient = new LitNodeClientNodeJs({
      litNetwork: LitNetwork.Cayenne,
    });
    await litNodeClient.connect();

    const encoder = new TextEncoder();
    const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt(
      {
        accessControlConditions: [],
        dataToEncrypt: encoder.encode("foo"),
      },
      litNodeClient
    );
    console.log(
      "ciphertext",
      ciphertext,
      "dataToEncryptHash",
      dataToEncryptHash
    );
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient.disconnect();
  }
})();
