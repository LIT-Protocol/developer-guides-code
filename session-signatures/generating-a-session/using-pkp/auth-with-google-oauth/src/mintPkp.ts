import {
  LIT_NETWORK as _LIT_NETWORK,
  AuthMethodScope,
  AuthMethodType,
} from '@lit-protocol/constants';
import bs58 from 'bs58';
import { ethers } from 'ethers';
import {
  getEthersSigner,
  getGoogleAuthMethodInfo,
  getLitActionCodeIpfsCid,
  getLitContractsClient,
  getPkpInfoFromMintReceipt,
  getPkpMintCost,
} from './utils';
import type { GoogleUser } from './types';

const LIT_NETWORK =
  _LIT_NETWORK[import.meta.env.VITE_LIT_NETWORK as keyof typeof _LIT_NETWORK];

export const mintPkp = async (googleUser: GoogleUser) => {
  try {
    const ethersSigner = await getEthersSigner();
    const litContracts = await getLitContractsClient(ethersSigner, LIT_NETWORK);
    const pkpMintCost = await getPkpMintCost(litContracts);
    const { authMethodType, authMethodId } =
      getGoogleAuthMethodInfo(googleUser);

    const GOOGLE_JWT_AUTH_METHOD_TYPE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes('Lit Developer Guide Google Auth Example')
    );

    console.log('🔄 Minting new PKP...');
    const tx =
      await litContracts.pkpHelperContract.write.mintNextAndAddAuthMethods(
        AuthMethodType.LitAction, // keyType
        [AuthMethodType.LitAction, GOOGLE_JWT_AUTH_METHOD_TYPE], // permittedAuthMethodTypes
        [
          `0x${Buffer.from(
            bs58.decode(await getLitActionCodeIpfsCid())
          ).toString('hex')}`,
          authMethodId,
        ], // permittedAuthMethodIds
        ['0x', '0x'], // permittedAuthMethodPubkeys
        [[AuthMethodScope.SignAnything], [AuthMethodScope.NoPermissions]], // permittedAuthMethodScopes
        true, // addPkpEthAddressAsPermittedAddress
        true, // sendPkpToItself
        { value: pkpMintCost }
      );
    const receipt = await tx.wait();
    console.log(`✅ Minted new PKP`);

    return getPkpInfoFromMintReceipt(receipt, litContracts);
  } catch (error) {
    console.error(error);
  }
};
