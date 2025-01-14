import { LIT_NETWORK } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

export const getLitNodeClient = async () => {
  console.log("🔄 Connecting LitNodeClient to Lit network...");
  const litNodeClient = new LitNodeClient({
    litNetwork: LIT_NETWORK.DatilTest,
    debug: true,
  });
  await litNodeClient.connect();
  console.log("✅ Connected LitNodeClient to Lit network");
  return litNodeClient;
};
