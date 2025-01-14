import bs58 from "bs58";
import IpfsHash from "typestub-ipfs-only-hash";

import { litActionCode } from "./lit-action";
import { connectEthereumAccount } from "./connect-ethereum-account";
import { getGoogleAuthMethodMetadata } from "./get-auth-method-metadata";
import { getLitContracts } from "./get-lit-contracts";
import { AUTH_METHOD_SCOPE, AUTH_METHOD_TYPE } from "@lit-protocol/constants";
import { getPkpInfoFromMintReceipt } from "./get-pkp-info-from-receipt";

export const mintPkp = async (credentialResponse: {
  credential: string;
  clientId: string;
}) => {
  try {
    const ethersSigner = await connectEthereumAccount();
    const litContracts = await getLitContracts(ethersSigner);
    const authMethodMetadata = getGoogleAuthMethodMetadata(credentialResponse);

    console.log(
      `ℹ️ Auth Method Metadata: ${JSON.stringify(authMethodMetadata, null, 2)}`
    );

    console.log("🔄 Getting PKP mint cost...");
    const pkpMintCost = await litContracts.pkpNftContract.read.mintCost();
    console.log("✅ Got PKP mint cost");

    console.log("🔄 Calculating the IPFS CID for Lit Action code string...");
    const litActionIpfsCid = await IpfsHash.of(litActionCode);
    console.log(
      `✅ Calculated IPFS CID: ${litActionIpfsCid}. Hexlified version: 0x${Buffer.from(
        bs58.decode(litActionIpfsCid)
      ).toString("hex")}`
    );

    console.log("🔄 Minting new PKP...");
    const tx =
      await litContracts.pkpHelperContract.write.mintNextAndAddAuthMethods(
        AUTH_METHOD_TYPE.LitAction, // keyType
        [AUTH_METHOD_TYPE.LitAction, authMethodMetadata.authMethodType], // permittedAuthMethodTypes
        [
          // This is the IPFS CID of the Lit Action which does the custom Google auth
          `0x${Buffer.from(bs58.decode(litActionIpfsCid)).toString("hex")}`,
          // This is the hash of the user's Google auth credential
          authMethodMetadata.authMethodId,
        ], // permittedAuthMethodIds
        ["0x", "0x"], // permittedAuthMethodPubkeys
        // permittedAuthMethodScopes
        [
          // Allow the custom Lit Action to sign anything using the PKP
          [AUTH_METHOD_SCOPE.SignAnything],
          // The custom authMethodType and authMethodId are added to the PKP as permitted auth methods,
          // however, they are not allowed to be used by themselves for signing with the PKP.
          // Instead they MUST be used in conjunction with the custom Lit Action in order to sign with the PKP.
          [AUTH_METHOD_SCOPE.NoPermissions],
        ],
        // addPkpEthAddressAsPermittedAddress
        // This allows the PKP to update it's own Lit Auth Method,
        // or transfer ownership of the PKP to another address
        true,
        // sendPkpToItself
        // This means the PKP ETH address is the owner of the PKP NFT
        true,
        // mintCost
        { value: pkpMintCost }
      );
    const receipt = await tx.wait();
    console.log(`✅ Minted new PKP`);

    const pkpInfo = await getPkpInfoFromMintReceipt(receipt, litContracts);
    console.log(`ℹ️ PKP Public Key: ${pkpInfo.publicKey}`);
    console.log(`ℹ️ PKP Token ID: ${pkpInfo.tokenId}`);
    console.log(`ℹ️ PKP ETH Address: ${pkpInfo.ethAddress}`);

    return pkpInfo;
  } catch (error) {
    console.error(error);
  }
};
