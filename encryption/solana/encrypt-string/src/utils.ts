import { LitNodeClient } from '@lit-protocol/lit-node-client';
// @ts-ignore
import {
  AUTH_METHOD_SCOPE,
  AUTH_METHOD_TYPE,
  LIT_ABILITY,
  LIT_NETWORK,
  LIT_RPC,
} from '@lit-protocol/constants';
import { ethers } from 'ethers';
import ipfsOnlyHash from 'typestub-ipfs-only-hash';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

import { LitAccessControlConditionResource } from '@lit-protocol/auth-helpers';
import { LitActionResource } from '@lit-protocol/auth-helpers';
import { AuthSig, SessionSigs, SolRpcConditions } from '@lit-protocol/types';
import { LitPKPResource } from '@lit-protocol/auth-helpers';
import { SiwsObject } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const litActionCodeSessionSigs = readFileSync(
  join(__dirname, './litActions/dist/litActionSessionSigs.js'),
  'utf8'
);
const litActionCodeDecrypt = readFileSync(
  join(__dirname, './litActions/dist/litActionDecrypt.js'),
  'utf8'
);

export const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === '')
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

export const getEthersSigner = (ethereumPrivateKey: string) => {
  console.log('🔄 Getting Ethers signer...');
  const ethersSigner = new ethers.Wallet(
    ethereumPrivateKey,
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
  );
  console.log('✅ Got Ethers signer');
  return ethersSigner;
};

export const getLitNodeClient = async (
  litNetwork: (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK]
) => {
  console.log(`🔄 Connecting LitNodeClient to the ${litNetwork} network...`);
  const litNodeClient = new LitNodeClient({
    litNetwork,
    debug: false,
  });
  await litNodeClient.connect();
  console.log(`✅ Connected LitNodeClient to the ${litNetwork} network`);
  return litNodeClient;
};

export const getLitContractsClient = async (
  ethersSigner: ethers.Wallet,
  litNetwork: (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK]
) => {
  console.log(
    `🔄 Connecting LitContracts Client to the ${litNetwork} network...`
  );
  const litContractsClient = new LitContracts({
    signer: ethersSigner,
    network: litNetwork,
    debug: false,
  });
  await litContractsClient.connect();
  console.log(`✅ Connected LitContracts Client to the ${litNetwork} network`);
  return litContractsClient;
};

export const getAccessControlConditions = async (solanaPublicKey: string) => {
  console.log('🔄 Generating access control conditions...');
  const accessControlConditions: SolRpcConditions = [
    {
      method: '',
      params: [':userAddress'],
      pdaParams: [],
      pdaInterface: { offset: 0, fields: {} },
      pdaKey: '',
      chain: 'solana',
      returnValueTest: {
        key: '',
        comparator: '=',
        value: solanaPublicKey,
      },
    },
    { operator: 'and' },
    {
      method: '',
      params: [':currentActionIpfsId'],
      pdaParams: [],
      pdaInterface: { offset: 0, fields: {} },
      pdaKey: '',
      chain: 'solana',
      returnValueTest: {
        key: '',
        comparator: '=',
        value: await calculateLitActionCodeCID(litActionCodeDecrypt),
      },
    },
  ];
  console.log('✅ Generated access control conditions');
  return accessControlConditions;
};

export const encryptString = async (
  litNodeClient: LitNodeClient,
  accessControlConditions: SolRpcConditions,
  stringToEncrypt: string
) => {
  console.log('🔄 Encrypting the string...');
  const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
    dataToEncrypt: new TextEncoder().encode(stringToEncrypt),
    solRpcConditions: accessControlConditions,
  });
  console.log('✅ Encrypted the string');
  console.log(`ℹ️  ciphertext: ${ciphertext}`);
  console.log(`ℹ️  dataToEncryptHash: ${dataToEncryptHash}`);
  return { ciphertext, dataToEncryptHash };
};

export const mintCapacityCredit = async (
  litContractsClient: LitContracts,
  requestsPerKilosecond: number = 10,
  daysUntilUTCMidnightExpiration: number = 1
) => {
  try {
    console.log('🔄 Minting capacity credit...');
    const capacityTokenId = (
      await litContractsClient.mintCapacityCreditsNFT({
        requestsPerKilosecond,
        daysUntilUTCMidnightExpiration,
      })
    ).capacityTokenIdStr;
    console.log(`✅ Minted capacity credit with id: ${capacityTokenId}`);
    return capacityTokenId;
  } catch (error) {
    console.error('Error minting capacity credit:', error);
    throw error;
  }
};

export const calculateLitActionCodeCID = async (input: string) => {
  try {
    const cid = await ipfsOnlyHash.of(input);
    return cid;
  } catch (error) {
    console.error('Error calculating CID for litActionCode:', error);
    throw error;
  }
};

const getPkpInfoFromMintReceipt = async (
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

  return {
    tokenId: ethers.BigNumber.from(tokenId).toString(),
    publicKey,
    ethAddress,
  };
};

export const mintPkpAndAddPermittedAuthMethods = async (
  litContractsClient: LitContracts,
  solanaPublicKey: string
) => {
  const authMethodType = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('Lit Developer Guide Solana SIWS Example')
  );
  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(`siws:${solanaPublicKey}`)
  );

  console.log('🔄 Minting PKP...');
  const tx =
    await litContractsClient.pkpHelperContract.write.mintNextAndAddAuthMethods(
      AUTH_METHOD_TYPE.LitAction, // keyType
      [AUTH_METHOD_TYPE.LitAction, authMethodType], // permittedAuthMethodTypes
      [
        `0x${Buffer.from(
          ethers.utils.base58.decode(
            await calculateLitActionCodeCID(litActionCodeSessionSigs)
          )
        ).toString('hex')}`,
        authMethodId,
      ], // permittedAuthMethodIds
      ['0x', '0x'], // permittedAuthMethodPubkeys
      [[AUTH_METHOD_SCOPE.SignAnything], [AUTH_METHOD_SCOPE.NoPermissions]], // permittedAuthMethodScopes
      true, // addPkpEthAddressAsPermittedAddress
      true, // sendPkpToItself
      { value: await litContractsClient.pkpNftContract.read.mintCost() }
    );
  const receipt = await tx.wait();
  console.log('✅ Minted PKP');

  const pkpInfo = await getPkpInfoFromMintReceipt(receipt, litContractsClient);
  console.log(`ℹ️  Minted PKP with token id: ${pkpInfo.tokenId}`);
  console.log(`ℹ️  Minted PKP with public key: ${pkpInfo.publicKey}`);
  console.log(`ℹ️  Minted PKP with ETH address: ${pkpInfo.ethAddress}`);
  return pkpInfo;
};

export const getCapacityDelegationAuthSig = async (
  litNodeClient: LitNodeClient,
  ethersWallet: ethers.Wallet,
  capacityTokenId: string,
  delegateeAddresses: string[],
  uses: string = '1'
) => {
  console.log('🔄 Creating capacityDelegationAuthSig...');
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: ethersWallet,
      capacityTokenId,
      delegateeAddresses,
      uses,
    });
  console.log('✅ Capacity Delegation Auth Sig created');
  return capacityDelegationAuthSig;
};

export const getSiwsMessage = (siwsInput: SiwsObject['siwsInput']) => {
  console.log('🔄 Generating SIWS message...');
  let message = `${siwsInput.domain} wants you to sign in with your Solana account:\n${siwsInput.address}`;

  if (siwsInput.statement) {
    message += `\n\n${siwsInput.statement}`;
  }

  const fields = [];

  if (siwsInput.uri !== undefined) fields.push(`URI: ${siwsInput.uri}`);
  if (siwsInput.version !== undefined)
    fields.push(`Version: ${siwsInput.version}`);
  if (siwsInput.chainId !== undefined)
    fields.push(`Chain ID: ${siwsInput.chainId}`);
  if (siwsInput.nonce !== undefined) fields.push(`Nonce: ${siwsInput.nonce}`);
  if (siwsInput.issuedAt !== undefined)
    fields.push(`Issued At: ${siwsInput.issuedAt}`);
  if (siwsInput.expirationTime !== undefined)
    fields.push(`Expiration Time: ${siwsInput.expirationTime}`);
  if (siwsInput.notBefore !== undefined)
    fields.push(`Not Before: ${siwsInput.notBefore}`);
  if (siwsInput.requestId !== undefined)
    fields.push(`Request ID: ${siwsInput.requestId}`);
  if (siwsInput.resources !== undefined && siwsInput.resources.length > 0) {
    fields.push('Resources:');
    for (const resource of siwsInput.resources) {
      fields.push(`- ${resource}`);
    }
  }

  if (fields.length > 0) {
    message += `\n\n${fields.join('\n')}`;
  }

  console.log(`✅ Generated SIWS message:\n${message}`);
  return message;
};

export const signSiwsMessage = (
  messageBytes: Uint8Array,
  solanaSigner: Keypair
) => {
  console.log('🔄 Signing SIWS message...');
  const signature = bs58.encode(
    nacl.sign.detached(messageBytes, solanaSigner.secretKey)
  );
  console.log(`✅ Signed SIWS message: ${signature}`);
  return signature;
};

export const getSessionSignatures = async (
  litNodeClient: LitNodeClient,
  pkpInfo: { publicKey: string; tokenId: string },
  capacityDelegationAuthSig: AuthSig,
  siwsObject: SiwsObject
) => {
  console.log('🔄 Getting session sigs...');
  const sessionSigs = await litNodeClient.getLitActionSessionSigs({
    pkpPublicKey: pkpInfo.publicKey,
    litActionCode: Buffer.from(litActionCodeSessionSigs).toString('base64'),
    capabilityAuthSigs: [capacityDelegationAuthSig],
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource('*'),
        ability: LIT_ABILITY.PKPSigning,
      },
      {
        resource: new LitActionResource('*'),
        ability: LIT_ABILITY.LitActionExecution,
      },
      {
        resource: new LitAccessControlConditionResource('*'),
        ability: LIT_ABILITY.AccessControlConditionDecryption,
      },
    ],
    jsParams: {
      siwsObject: JSON.stringify(siwsObject),
      pkpTokenId: pkpInfo.tokenId,
    },
  });
  console.log('✅ Got session sigs');
  return sessionSigs;
};

export const decryptString = async (
  litNodeClient: LitNodeClient,
  sessionSigs: SessionSigs,
  siwsObject: SiwsObject,
  solRpcConditions: SolRpcConditions,
  ciphertext: string,
  dataToEncryptHash: string
) => {
  try {
    console.log('🔄 Decrypting data...');
    const response = await litNodeClient.executeJs({
      code: litActionCodeDecrypt,
      sessionSigs,
      jsParams: {
        siwsObject: JSON.stringify(siwsObject),
        solRpcConditions,
        ciphertext,
        dataToEncryptHash,
      },
    });
    console.log('✅ Decrypted data');

    return response.response;
  } catch (error) {
    console.error('Error in decryptData:', error);
    throw error;
  }
};
