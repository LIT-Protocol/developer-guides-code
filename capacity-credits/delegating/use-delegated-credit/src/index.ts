import { LIT_ABILITY } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitActionResource,
} from '@lit-protocol/auth-helpers';
import { getEnv, getEthersSigner, getLitNodeClient } from './utils';

const ETHEREUM_PRIVATE_KEY = getEnv('ETHEREUM_PRIVATE_KEY');

export const runExample = async (
  capacityTokenId: string,
  delegateeAddresses: string[]
) => {
  let litNodeClient: LitNodeClient;

  try {
    litNodeClient = await getLitNodeClient();
    const delegatorSigner = getEthersSigner(ETHEREUM_PRIVATE_KEY);

    console.log('🔄 Generating delegation Auth Signature...');
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: delegatorSigner,
        capacityTokenId,
        delegateeAddresses,
        uses: '1',
        expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      });
    console.log('✅ Generated delegation Auth Signature');

    console.log('🔄 Generating Session Signatures...');
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: 'ethereum',
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      capabilityAuthSigs: [capacityDelegationAuthSig],
      resourceAbilityRequests: [
        {
          resource: new LitActionResource('*'),
          ability: LIT_ABILITY.LitActionExecution,
        },
      ],
      authNeededCallback: async ({
        resourceAbilityRequests,
        expiration,
        uri,
      }) => {
        const toSign = await createSiweMessageWithRecaps({
          uri: uri!,
          expiration: expiration!,
          resources: resourceAbilityRequests!,
          walletAddress: delegatorSigner.address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: delegatorSigner,
          toSign,
        });
      },
    });
    console.log('✅ Generated Session Signatures');

    return sessionSigs;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
