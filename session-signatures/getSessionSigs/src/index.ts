import { LitNetwork } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
  createSiweMessageWithRecaps,
} from "@lit-protocol/auth-helpers";
import { AuthCallbackParams, AuthSig } from "@lit-protocol/types";
import { privateKeyToAccount } from "viem/accounts";
import { Account } from "viem";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY"); // Same as process.env

export const getSessionSigsViaAuthSig = async () => {
  let litNodeClient: LitNodeClient;
  const account = privateKeyToAccount(`0x${ETHEREUM_PRIVATE_KEY}`);

  try {
    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    console.log("🔄 Getting Session Sigs via an Auth Sig...");

    const createAuthSig = async (
      params: AuthCallbackParams,
      account: Account
    ): Promise<AuthSig> => {
      const address = account.address;
      const preparedMessage = await createSiweMessageWithRecaps({
        uri: String(params.uri),
        expiration: String(params.expiration),
        resources: params.resourceAbilityRequests!,
        walletAddress: address as `0x${string}`,
        nonce: params.nonce,
        litNodeClient: litNodeClient,
        statement: params.statement,
        chainId: 84532,
        //domain: process.env.NEXT_PUBLIC_HOST,
      });

      const signature = await account.signMessage!({
        message: preparedMessage,
      });

      return {
        sig: signature,
        derivedVia: "ethereum.web3.auth",
        signedMessage: preparedMessage,
        address: address as string,
      };
    };

    const sessionSignatures = await litNodeClient.getSessionSigs({
      chain: "baseSepolia",
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
      ],
      authNeededCallback: async (params) => {
        return await createAuthSig(params, account);
      },
      //capacityDelegationAuthSig,
    });
    console.log(sessionSignatures);

    const litActionCode = `
    const go = async () => {
      console.log("The answer to the universe is 42.");
    };
    go();
  `;

    const litActionResult = await litNodeClient.executeJs({
      code: litActionCode,
      sessionSigs: sessionSignatures,
      jsParams: {},
    });

    console.log(litActionResult);

    console.log("✅ Got Session Sigs via an Auth Sig");
    return sessionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
