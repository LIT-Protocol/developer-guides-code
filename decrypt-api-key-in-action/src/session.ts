import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { genAuthSig } from "./wallet";
import {ethers} from 'ethers';
import { LitResourceAbilityRequest } from "@lit-protocol/auth-helpers";
import { AuthCallbackParams } from "@lit-protocol/types";

export const genSession = async (
    wallet: ethers.Wallet,
    client: LitNodeClient,
    resources: LitResourceAbilityRequest[]) => {
    let sessionSigs = await client.getSessionSigs({
        chain: "ethereum",
        resourceAbilityRequests: resources,
        authNeededCallback: async (params: AuthCallbackParams) => {
          console.log("resourceAbilityRequests:", params.resources);

          if (!params.expiration) {
            throw new Error("expiration is required");
          }
  
          if (!params.resources) {
            throw new Error("resourceAbilityRequests is required");
          }
  
          if (!params.uri) {
            throw new Error("uri is required");
          }

          // generate the authSig for the inner signature of the session
          // we need capabilities to assure that only one api key may be decrypted
          const authSig = genAuthSig(wallet, client, params.uri, params.resourceAbilityRequests ?? []);
          return authSig;
        }
    });

    return sessionSigs;
}