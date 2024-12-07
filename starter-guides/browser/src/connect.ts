declare global {
  interface Window {
    ethereum: any;
  }
}

import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_NETWORK} from '@lit-protocol/constants';
import { createSafeClient } from '@safe-global/sdk-starter-kit'
import * as ethers from 'ethers';

export const connectToLit = async () => {
    try {
      // More information about the available Lit Networks: https://developer.litprotocol.com/category/networks
      const litNodeClient = new LitNodeClient({
        litNetwork: LIT_NETWORK.DatilDev,
        debug: false
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const ethersSigner = provider.getSigner();
      console.log("Connected account:", await ethersSigner.getAddress());

      await litNodeClient.connect();
      console.log('Connected to Lit Network');
    } catch (error) {
      console.error('Failed to connect to Lit Network:', error);
    }
  };
