import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { AuthMethodType, LitNetwork } from "@lit-protocol/constants";
import { LitAuthClient } from "@lit-protocol/lit-auth-client";
import bs58 from "bs58";
// @ts-ignore
import IpfsHash from "ipfs-only-hash";

import { getEnv } from "./utils";
import { litActionCode } from "./litAction";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const runExample = async () => {
  let litNodeClient: LitNodeClient;
  try {
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });

    const litAuthClient = new LitAuthClient();
    litAuthClient.initProvider();

    const litActionIpfsCid = await IpfsHash.of(litActionCode);

    const result = await litNodeClient.claimKeyId({
      authMethod: {
        authMethodType: AuthMethodType.LitAction,
        accessToken: `0x${Buffer.from(bs58.decode(litActionIpfsCid)).toString(
          "hex"
        )}`,
      },
    });
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
