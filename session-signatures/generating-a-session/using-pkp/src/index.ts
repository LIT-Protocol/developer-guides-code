import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_ABILITY } from '@lit-protocol/constants';
import { LitPKPResource } from '@lit-protocol/auth-helpers';
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';

import {
  getEthersSigner,
  getLitNodeClient,
  type LIT_NETWORKS_KEYS,
} from './utils';

export const getpkpSessionSigs = async (
  litNetwork: LIT_NETWORKS_KEYS,
  pkp: {
    tokenId: any;
    publicKey: string;
    ethAddress: string;
  }
) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = getEthersSigner();
    litNodeClient = await getLitNodeClient(litNetwork);

    console.log('🔄 Creating AuthMethod using the ethersSigner...');
    const authMethod = await EthWalletProvider.authenticate({
      signer: ethersSigner,
      // @ts-expect-error There seems to be a bug with the types
      litNodeClient,
    });
    console.log('✅ Finished creating the AuthMethod');

    console.log('🔄 Getting the Session Sigs for the PKP...');
    const sessionSignatures = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: pkp.publicKey!,
      authMethods: [authMethod],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource('*'),
          ability: LIT_ABILITY.PKPSigning,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log('✅ Got PKP Session Sigs');

    return sessionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
