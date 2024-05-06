import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { genAuthSig } from "./wallet";
import {ethers} from 'ethers';
import { LitResourceAbilityRequest } from "@lit-protocol/auth-helpers";
import { AuthCallbackParams } from "@lit-protocol/types";

export const genSession = async (
    wallet: ethers.Wallet,
    client: LitNodeClient,
    resources: LitResourceAbilityRequest[], 
    authSig?: any) => {
    let sessionSigs = await client.getSessionSigs({
        chain: "ethereum",
        resourceAbilityRequests: resources,
        authNeededCallback: async ({
            uri,
            expiration,
            resourceAbilityRequests,
          }: AuthCallbackParams) => {
            const authSig = genAuthSig(wallet, client, resources);
            return authSig;
          }
    });

    return sessionSigs;
}