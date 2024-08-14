import { AuthMethodScope, LitNetwork } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from "ethers";
import { JwtPayload } from "jwt-decode";

export const mintPkp = async (decodedGoogleJwt: JwtPayload) => {
  try {
    console.log("🔄 Connecting to Ethereum account...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const ethersSigner = provider.getSigner();
    console.log(
      "ℹ️ Connected Ethereum account:",
      await ethersSigner.getAddress()
    );

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.DatilTest,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    console.log("🔄 Minting new PKP...");
    const authMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(
        `${decodedGoogleJwt.sub}:${decodedGoogleJwt.aud}`
      )
    );

    const pkpMintCost = await litContracts.pkpNftContract.read.mintCost();

    const tx =
      await litContracts.pkpHelperContract.write.mintNextAndAddAuthMethods(
        6, // keyType
        [6], // permittedAuthMethodTypes
        [authMethodId], // permittedAuthMethodIds
        ["0x"], // permittedAuthMethodPubkeys
        [[AuthMethodScope.SignAnything]], // permittedAuthMethodScopes
        true, // addPkpEthAddressAsPermittedAddress
        true, // sendPkpToItself
        { value: pkpMintCost }
      );
    const receipt = await tx.wait();

    const pkpInfo = await getPkpInfoFromMintReceipt(receipt, litContracts);

    console.log(`✅ Minted new PKP`);
    console.log(`ℹ️ PKP Public Key: ${pkpInfo.publicKey}`);
    console.log(`ℹ️ PKP Token ID: ${pkpInfo.tokenId}`);
    console.log(`ℹ️ PKP ETH Address: ${pkpInfo.ethAddress}`);

    return pkpInfo;
  } catch (error) {
    console.error(error);
  }
};

const getPkpInfoFromMintReceipt = async (
  txReceipt: ethers.ContractReceipt,
  litContractsClient: LitContracts
) => {
  const pkpMintedEvent = txReceipt!.events!.find(
    (event) =>
      event.topics[0] ===
      "0x3b2cc0657d0387a736293d66389f78e4c8025e413c7a1ee67b7707d4418c46b8"
  );

  const publicKey = "0x" + pkpMintedEvent!.data.slice(130, 260);
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
