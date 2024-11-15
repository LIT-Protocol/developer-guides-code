import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";

export const runExample = async () => {
  let litNodeClient: LitNodeClient;

  try {
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: true,
    });
    await litNodeClient.connect();
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
