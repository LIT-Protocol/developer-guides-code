import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_NETWORK as _LIT_NETWORK } from '@lit-protocol/constants';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

import {
  encryptString,
  getAccessControlConditions,
  getEnv,
  getEthersSigner,
  getLitNodeClient,
  getLitContractsClient,
  getSessionSignatures,
  getSiwsMessage,
  signSiwsMessage,
  mintCapacityCredit,
  mintPkpAndAddPermittedAuthMethods,
  getCapacityDelegationAuthSig,
  decryptString,
} from './utils';
import { SiwsObject } from './types';

const ETHEREUM_PRIVATE_KEY = getEnv('ETHEREUM_PRIVATE_KEY');
const SOLANA_PRIVATE_KEY = getEnv('SOLANA_PRIVATE_KEY');
const LIT_NETWORK = process.env.LIT_NETWORK ?? _LIT_NETWORK.DatilDev;
const LIT_ACTION_CAPACITY_CREDIT_TOKEN_ID =
  process.env.LIT_ACTION_CAPACITY_CREDIT_TOKEN_ID;

export const runExample = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = getEthersSigner(ETHEREUM_PRIVATE_KEY);
    const solanaSigner = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY));
    // @ts-ignore
    litNodeClient = await getLitNodeClient(LIT_NETWORK);
    const litContractsClient = await getLitContractsClient(
      ethersSigner,
      // @ts-ignore
      LIT_NETWORK
    );

    let litCapacityCreditTokenId =
      LIT_ACTION_CAPACITY_CREDIT_TOKEN_ID as string;
    if (litCapacityCreditTokenId === '') {
      litCapacityCreditTokenId = await mintCapacityCredit(litContractsClient);
    } else {
      console.log(
        `ℹ️  Using existing Lit Capacity Credit Token ID: ${litCapacityCreditTokenId}`
      );
    }

    const pkpInfo = await mintPkpAndAddPermittedAuthMethods(
      litContractsClient,
      solanaSigner.publicKey.toBase58()
    );
    const capacityDelegationAuthSig = await getCapacityDelegationAuthSig(
      litNodeClient,
      ethersSigner,
      litCapacityCreditTokenId,
      [pkpInfo.ethAddress]
    );

    const accessControlConditions = await getAccessControlConditions(
      solanaSigner.publicKey.toBase58()
    );

    const { ciphertext, dataToEncryptHash } = await encryptString(
      litNodeClient,
      accessControlConditions,
      'The answer to life, the universe, and everything is 42.'
    );

    const siwsObject: SiwsObject = {
      siwsInput: {
        address: solanaSigner.publicKey.toBase58(),
        domain: 'localhost',
        uri: 'http://localhost:3000',
        statement:
          'This is a test statement, replace this with whatever you want',
        expirationTime: new Date(Date.now() + 60 * 60 * 10).toISOString(), // 10 minutes from now
        resources: [],
      },
      signature: '',
    };
    const messageStr = getSiwsMessage(siwsObject.siwsInput);
    const messageBytes = new TextEncoder().encode(messageStr);

    siwsObject.signature = signSiwsMessage(messageBytes, solanaSigner);

    const sessionSignatures = await getSessionSignatures(
      litNodeClient,
      pkpInfo,
      capacityDelegationAuthSig,
      siwsObject
    );

    const decryptedString = await decryptString(
      litNodeClient,
      sessionSignatures,
      siwsObject,
      accessControlConditions,
      ciphertext,
      dataToEncryptHash
    );

    return decryptedString;
  } catch (error) {
    console.error(error);
  } finally {
    // @ts-ignore
    litNodeClient!.disconnect();
  }
};
