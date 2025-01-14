import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitActionResource, LitPKPResource } from "@lit-protocol/auth-helpers";
import { LIT_ABILITY } from "@lit-protocol/constants";

import { litActionCode } from "../litAction";
import { getLitContracts } from "./get-lit-contracts";
import { connectEthereumAccount } from "./connect-ethereum-account";
import { getLitNodeClient } from "./get-lit-node-client";
import { getCapacityDelegationAuthSig } from "./get-capacity-delegation-auth-sig";
import { mintCapacityCredit } from "./mint-capacity-credit";

export interface MintedPkp {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
}

const { VITE_LIT_CAPACITY_CREDIT_TOKEN_ID } = import.meta.env;

export const getPkpSessionSigs = async (
  credentialResponse: { credential: string; clientId: string },
  mintedPkp: MintedPkp
) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = await connectEthereumAccount();
    const litContracts = await getLitContracts(ethersSigner);
    litNodeClient = await getLitNodeClient();

    let capacityTokenId = VITE_LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (capacityTokenId === undefined) {
      capacityTokenId = await mintCapacityCredit(litContracts);
    } else {
      console.log(
        `ℹ️ Using provided Capacity Credit with ID: ${capacityTokenId}`
      );
    }

    const capacityDelegationAuthSig = await getCapacityDelegationAuthSig(
      litNodeClient,
      ethersSigner,
      mintedPkp,
      capacityTokenId
    );

    console.log(
      `🔄 Getting PKP Session Sigs using ${mintedPkp.ethAddress} (${mintedPkp.tokenId}) using Lit Action code string...`
    );
    const sessionSignatures = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: mintedPkp.publicKey,
      capabilityAuthSigs: [capacityDelegationAuthSig],
      litActionCode: Buffer.from(litActionCode).toString("base64"),
      jsParams: {
        googleCredential: credentialResponse.credential,
        googleClientId: credentialResponse.clientId,
        pkpTokenId: mintedPkp.tokenId,
      },
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LIT_ABILITY.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LIT_ABILITY.LitActionExecution,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log(
      `✅ Got PKP Session Sigs: ${JSON.stringify(sessionSignatures, null, 2)}`
    );
    return sessionSignatures;
  } catch (error) {
    console.error(error);
  }
};
