import { LitNodeClient } from '@lit-protocol/lit-node-client';
import  { LIT_NETWORK } from '@lit-protocol/constants';

const connectToLit = async () => {
    try {
      // More information about the available Lit Networks: https://developer.litprotocol.com/category/networks
      const litNodeClient = new LitNodeClient({
        litNetwork: LIT_NETWORK.DatilDev,
        debug: false
      });

      await litNodeClient.connect();
      console.log('Connected to Lit Network');
    } catch (error) {
      console.error('Failed to connect to Lit Network:', error);
    }
};

connectToLit();
