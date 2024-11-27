import { LIT_NETWORK, LIT_RPC } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

export type LIT_NETWORKS_KEYS = (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK];

export const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === '')
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

export const getEthersSigner = () => {
  const ETHEREUM_PRIVATE_KEY = getEnv('ETHEREUM_PRIVATE_KEY');
  return new ethers.Wallet(
    ETHEREUM_PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
  );
};

export const getLitNodeClient = async (litNetwork: LIT_NETWORKS_KEYS) => {
  console.log('🔄 Connecting LitNodeClient to Lit network...');
  const litNodeClient = new LitNodeClient({
    litNetwork,
    debug: false,
  });
  await litNodeClient.connect();
  console.log('✅ Connected LitNodeClient to Lit network');

  return litNodeClient;
};
