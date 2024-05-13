import { LitResourceAbilityRequest } from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {ethers} from 'ethers';
import { SiweMessage } from 'siwe';

export const genProvider = () => {
    return new ethers.providers.JsonRpcProvider('https://chain-rpc.litprotocol.com/http');
}

export const genWallet = () => {
    // known private key for testing
    // replace with your own key
    return new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', genProvider());
}

export const genAuthSig = async (
    wallet: ethers.Wallet,
    client: LitNodeClient,
    resources: LitResourceAbilityRequest[]) => {
    const ONE_WEEK_FROM_NOW = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 7
    ).toISOString();
    let blockHash = await client.getLatestBlockhash();
    let siweParams = {
        domain: 'localhost',
        address: wallet.address,
        statement: 'This is a test statement.  You can put anything you want here.',
        uri: 'https://localhost/login',
        version: '1',
        chainId: 1,
        nonce: blockHash,
        expirationTime: ONE_WEEK_FROM_NOW,
    };

    let siweMessage = new SiweMessage(siweParams);
    let message = siweMessage.prepareMessage();
    // Sign the message and format the authSig
    const signature = await wallet.signMessage(message);

    const authSig = {
        sig: signature,
        derivedVia: 'web3.eth.personal.sign',
        signedMessage: signature,
        address: wallet.address,
    };


    return authSig;
}