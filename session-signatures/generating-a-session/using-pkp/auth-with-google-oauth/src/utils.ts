import { ethers } from 'ethers';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { AUTH_METHOD_TYPE, LIT_NETWORK } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import * as IpfsHash from 'typestub-ipfs-only-hash';

import type { GoogleUser } from './types';
import { litActionCode } from './litAction';

export const getEthersSigner = async () => {
  console.log('🔄 Connecting to Ethereum account...');
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const ethersSigner = provider.getSigner();
  console.log(
    '✅ Connected Ethereum account:',
    await ethersSigner.getAddress()
  );

  return ethersSigner;
};

let litNodeClient: LitNodeClient | null = null;
export const getLitNodeClient = async (
  litNetwork: (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK]
) => {
  if (litNodeClient === null) {
    console.log(`🔄 Connecting LitNode client to the ${litNetwork} network...`);
    litNodeClient = new LitNodeClient({
      litNetwork,
      debug: Boolean(import.meta.env.VITE_LIT_DEBUG),
    });
    await litNodeClient.connect();
    console.log(`✅ Connected LitNode client to the ${litNetwork} network`);
  }

  return litNodeClient;
};

let litContractClient: LitContracts | null = null;
export const getLitContractsClient = async (
  ethersSigner: ethers.providers.JsonRpcSigner,
  litNetwork: (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK]
) => {
  if (litContractClient === null) {
    console.log('🔄 Connecting LitContracts client to the network...');
    litContractClient = new LitContracts({
      signer: ethersSigner,
      network: litNetwork,
    });
    await litContractClient.connect();
    console.log('✅ Connected LitContracts client to the network');
  }

  return litContractClient;
};

export const getGoogleAuthMethodInfo = (googleUser: GoogleUser) => {
  console.log('🔄 Generating Auth Method type and ID...');
  const authMethodInfo = {
    authMethodType: AUTH_METHOD_TYPE.GoogleJwt,
    // Taken from here:
    // https://github.com/LIT-Protocol/js-sdk/blob/806264ace642c4c3f4fe1dc4f4c1067cdf54ef27/packages/lit-auth-client/src/lib/providers/GoogleProvider.ts#L216C3-L224C4
    authMethodId: ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`${googleUser.sub}:${googleUser.aud}`)
    ),
  };
  console.log('✅ Generated Auth Method type and ID');

  return authMethodInfo;
};

export const getPkpMintCost = async (litContracts: LitContracts) => {
  console.log('🔄 Getting PKP mint cost...');
  const pkpMintCost = await litContracts.pkpNftContract.read.mintCost();
  console.log('✅ Got PKP mint cost');

  return pkpMintCost;
};

export const getLitActionCodeIpfsCid = async () => {
  console.log('🔄 Calculating the IPFS CID for Lit Action code string...');
  const litActionIpfsCid = await IpfsHash.of(litActionCode);
  console.log(`✅ Calculated IPFS CID: ${litActionIpfsCid}`);

  return litActionIpfsCid;
};

export const getPkpInfoFromMintReceipt = async (
  txReceipt: ethers.ContractReceipt,
  litContractsClient: LitContracts
) => {
  const pkpMintedEvent = txReceipt!.events!.find(
    (event) =>
      event.topics[0] ===
      '0x3b2cc0657d0387a736293d66389f78e4c8025e413c7a1ee67b7707d4418c46b8'
  );

  const publicKey = '0x' + pkpMintedEvent!.data.slice(130, 260);
  const tokenId = ethers.utils.keccak256(publicKey);
  const ethAddress = await litContractsClient.pkpNftContract.read.getEthAddress(
    tokenId
  );

  console.log(`ℹ️ PKP Public Key: ${publicKey}`);
  console.log(`ℹ️ PKP Token ID: ${tokenId}`);
  console.log(`ℹ️ PKP ETH Address: ${ethAddress}`);

  return {
    tokenId: ethers.BigNumber.from(tokenId).toString(),
    publicKey,
    ethAddress,
  };
};

export const getCapacityCredit = async (
  ethersSigner: ethers.providers.JsonRpcSigner,
  litNetwork: (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK]
) => {
  try {
    const litContracts = await getLitContractsClient(ethersSigner, litNetwork);

    let capacityTokenId = import.meta.env.VITE_LIT_CAPACITY_CREDIT_TOKEN_ID;

    if (capacityTokenId === undefined) {
      console.log('🔄 Minting Capacity Credits NFT...');
      capacityTokenId = (
        await litContracts.mintCapacityCreditsNFT({
          requestsPerKilosecond: 10,
          daysUntilUTCMidnightExpiration: 1,
        })
      ).capacityTokenIdStr;
      console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    } else {
      console.log(
        `ℹ️ Using provided Capacity Credit with ID: ${capacityTokenId}`
      );
    }

    return capacityTokenId;
  } catch (error) {
    console.error(error);
  }
};
