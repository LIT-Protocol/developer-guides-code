const { LitNodeClient } = require('@lit-protocol/lit-node-client');
const { LitNetwork } = require('@lit-protocol/constants');

const connectToLit = async () => {
    try {
      // More information about the available Lit Networks: https://developer.litprotocol.com/category/networks
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
