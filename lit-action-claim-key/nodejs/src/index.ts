import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { AuthMethodType, LitNetwork } from "@lit-protocol/constants";

import { getEnv } from "./utils";
import { LitAuthClient } from "@lit-protocol/lit-auth-client";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const runExample = async () => {
  let litNodeClient: LitNodeClient;
  try {
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });

    const result = await litNodeClient.claimKeyId({
      authMethod: {
        authMethodType: AuthMethodType.LitAction,
        accessToken: "",
      },
    });
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
