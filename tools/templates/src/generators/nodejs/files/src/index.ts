import { getEnv } from './utils';

const ETHEREUM_PRIVATE_KEY = getEnv('ETHEREUM_PRIVATE_KEY');

export const runExample = async () => {
  try {
  } catch (error) {
    console.error(error);
  } finally {
    // Disconnect from LitNodeClient, etc.
  }
};
