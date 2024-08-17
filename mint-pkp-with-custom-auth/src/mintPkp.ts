import {
  AuthMethodScope,
  AuthMethodType,
  LitNetwork,
} from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from "ethers";
import bs58 from "bs58";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  auth_date: number;
  hash: string;
}

const VITE_LIT_ACTION_IPFS_CID = import.meta.env.VITE_LIT_ACTION_IPFS_CID;

export const mintPkp = async (telegramUser: TelegramUser) => {
  try {
    console.log("🔄 Connecting to Ethereum account...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const ethersSigner = provider.getSigner();
    console.log(
      "✅ Connected Ethereum account:",
      await ethersSigner.getAddress()
    );

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.DatilTest,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    console.log("🔄 Generating Auth Method type and ID...");
    const authMethodType = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("Lit Developer Guide Telegram Auth Example")
    );
    const authMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`telegram:${telegramUser.id}`)
    );
    console.log("✅ Generated Auth Method type and ID");

    console.log("🔄 Getting PKP mint cost...");
    const pkpMintCost = await litContracts.pkpNftContract.read.mintCost();
    console.log("✅ Got PKP mint cost");

    console.log("🔄 Minting new PKP...");
    console.log(
      `0x${Buffer.from(bs58.decode(VITE_LIT_ACTION_IPFS_CID)).toString("hex")}`
    );
    const tx =
      await litContracts.pkpHelperContract.write.mintNextAndAddAuthMethods(
        AuthMethodType.LitAction, // keyType
        [AuthMethodType.LitAction, authMethodType], // permittedAuthMethodTypes
        [
          `0x${Buffer.from(bs58.decode(VITE_LIT_ACTION_IPFS_CID)).toString(
            "hex"
          )}`,
          authMethodId,
        ], // permittedAuthMethodIds
        ["0x", "0x"], // permittedAuthMethodPubkeys
        [[AuthMethodScope.SignAnything], [AuthMethodScope.NoPermissions]], // permittedAuthMethodScopes
        true, // addPkpEthAddressAsPermittedAddress
        true, // sendPkpToItself
        { value: pkpMintCost }
      );
    const receipt = await tx.wait();
    console.log(`✅ Minted new PKP`);

    const pkpInfo = await getPkpInfoFromMintReceipt(receipt, litContracts);
    console.log(`ℹ️ PKP Public Key: ${pkpInfo.publicKey}`);
    console.log(`ℹ️ PKP Token ID: ${pkpInfo.tokenId}`);
    console.log(`ℹ️ PKP ETH Address: ${pkpInfo.ethAddress}`);

    console.log("🔄 Checking permitted auth methods...");
    const permittedAuthMethods =
      await litContracts.pkpPermissionsContract.read.getPermittedAuthMethods(
        pkpInfo.tokenId
      );
    console.log(
      `✅ Got permitted auth methods: ${JSON.stringify(
        permittedAuthMethods,
        null,
        2
      )}`
    );

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
