import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitNetwork, LIT_RPC } from '@lit-protocol/constants';
import * as ethers from 'ethers';

const connectToLit = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider({
        skipFetchSetup: true,
        url: LIT_RPC.CHRONICLE_YELLOWSTONE,
      });

      console.log("Provider", provider);

      const litNodeClient = new LitNodeClient({
        litNetwork: LitNetwork.DatilDev,
        debug: false
      });

      await litNodeClient.connect();
      console.log('Connected to Lit Network');
    } catch (error) {
      console.error('Failed to connect to Lit Network:', error);
    }
};

connectToLit();
