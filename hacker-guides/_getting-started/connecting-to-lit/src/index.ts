import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK } from "@lit-protocol/constants";

export const runExample = async () => {
  let litNodeClient: LitNodeClient;

  try {
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: true,
    });
    await litNodeClient.connect();
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
