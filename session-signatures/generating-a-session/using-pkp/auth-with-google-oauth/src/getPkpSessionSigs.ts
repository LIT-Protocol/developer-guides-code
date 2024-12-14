import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  LIT_NETWORK as _LIT_NETWORK,
  LIT_ABILITY,
} from '@lit-protocol/constants';
import { LitPKPResource } from '@lit-protocol/auth-helpers';

import type { MintedPkp } from './types';
import { litActionCode } from './litAction';
import { getCapacityCredit, getEthersSigner, getLitNodeClient } from './utils';

const LIT_NETWORK =
  _LIT_NETWORK[import.meta.env.VITE_LIT_NETWORK as keyof typeof _LIT_NETWORK];
const LIT_CAPACITY_CREDIT_TOKEN_ID =
  import.meta.env.VITE_LIT_CAPACITY_CREDIT_TOKEN_ID ?? null;

export const getPkpSessionSigs = async (
  googleJwt: string,
  mintedPkp: MintedPkp
) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = await getEthersSigner();
    litNodeClient = await getLitNodeClient(LIT_NETWORK);

    let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (!LIT_CAPACITY_CREDIT_TOKEN_ID) {
      capacityTokenId = await getCapacityCredit(ethersSigner, LIT_NETWORK);
    } else {
      console.log(
        `ℹ️ Using provided Capacity Credit with ID: ${capacityTokenId}`
      );
    }

    console.log('🔄 Creating capacityDelegationAuthSig...');
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersSigner,
        capacityTokenId,
        delegateeAddresses: [mintedPkp.ethAddress],
        uses: '1',
      });
    console.log(`✅ Created the capacityDelegationAuthSig`);

    console.log(
      `🔄 Getting the Session Sigs for the PKP using Lit Action code string...`
    );
    const sessionSignatures = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: mintedPkp.publicKey,
      capabilityAuthSigs: [capacityDelegationAuthSig],
      litActionCode: Buffer.from(litActionCode).toString('base64'),
      jsParams: {
        googleJwt,
        pkpTokenId: mintedPkp.tokenId,
      },
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource('*'),
          ability: LIT_ABILITY.PKPSigning,
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
