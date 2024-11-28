import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LIT_NETWORK } from '@lit-protocol/constants';
import { ethers } from 'ethers';

export const getLitContracts = async (
  ethersSigner: ethers.Wallet,
  litNetwork = LIT_NETWORK.DatilTest
) => {
  console.log('🔄 Connecting LitContracts client to network...');
  const litContracts = new LitContracts({
    signer: ethersSigner,
    network: litNetwork,
    debug: false,
  });
  await litContracts.connect();
  console.log('✅ Connected LitContracts client to network');

  return litContracts;
};

export const mintPkp = async (litContracts: LitContracts) => {
  console.log('🔄 Minting new PKP...');
  const pkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
  console.log(
    `✅ Minted new PKP with public key: ${pkp.publicKey} and ETH address: ${pkp.ethAddress}`
  );

  return pkp;
};
