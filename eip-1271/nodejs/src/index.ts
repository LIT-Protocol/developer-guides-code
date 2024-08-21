import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  AuthMethodScope,
  AuthMethodType,
  LitNetwork,
  LIT_RPC,
} from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import ethers from "ethers";
import bs58 from "bs58";
import {
  createSiweMessage,
  LitAbility,
  LitAccessControlConditionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";

import { getEnv } from "./utils";
import WhitelistEIP1271 from "./WhitelistEIP1271.json";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const LIT_ACTION_IPFS_CID = getEnv("LIT_ACTION_IPFS_CID");
const ANVIL_PRIVATE_KEY_1 = getEnv("ANVIL_PRIVATE_KEY_1");
const ANVIL_PRIVATE_KEY_2 = getEnv("ANVIL_PRIVATE_KEY_2");
const ANVIL_RPC_URL = getEnv("ANVIL_RPC_URL");
const DEPLOYED_EIP1271_WHITELIST_CONTRACT = getEnv(
  "DEPLOYED_EIP1271_WHITELIST_CONTRACT"
);
const LIT_CAPACITY_CREDIT_TOKEN_ID = process.env.LIT_CAPACITY_CREDIT_TOKEN_ID;
const LIT_NETWORK = LitNetwork.DatilTest;

export const runExample = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LIT_NETWORK,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    console.log("🔄 Getting PKP mint cost...");
    const pkpMintCost = await litContracts.pkpNftContract.read.mintCost();
    console.log("✅ Got PKP mint cost");

    console.log("🔄 Minting new PKP...");
    console.log(
      `0x${Buffer.from(bs58.decode(LIT_ACTION_IPFS_CID)).toString("hex")}`
    );
    const tx =
      await litContracts.pkpHelperContract.write.mintNextAndAddAuthMethods(
        AuthMethodType.LitAction, // keyType
        [AuthMethodType.LitAction], // permittedAuthMethodTypes
        [`0x${Buffer.from(bs58.decode(LIT_ACTION_IPFS_CID)).toString("hex")}`], // permittedAuthMethodIds
        ["0x"], // permittedAuthMethodPubkeys
        [[AuthMethodScope.SignAnything]], // permittedAuthMethodScopes
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

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK,
      debug: true,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (capacityTokenId === undefined) {
      console.log("🔄 Minting Capacity Credits NFT...");
      capacityTokenId = (
        await litContracts.mintCapacityCreditsNFT({
          requestsPerKilosecond: 10,
          daysUntilUTCMidnightExpiration: 1,
        })
      ).capacityTokenIdStr;
      console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    } else {
      console.log(
        `ℹ️ Using provided Capacity Credit with ID: ${LIT_CAPACITY_CREDIT_TOKEN_ID}`
      );
    }

    const provider = new ethers.providers.JsonRpcProvider(ANVIL_RPC_URL);

    const wallet1 = new ethers.Wallet(ANVIL_PRIVATE_KEY_1, provider);
    const wallet2 = new ethers.Wallet(ANVIL_PRIVATE_KEY_2, provider);

    const whitelistEIP1271_wallet1 = new ethers.Contract(
      DEPLOYED_EIP1271_WHITELIST_CONTRACT,
      WhitelistEIP1271.abi,
      wallet1
    );
    const whitelistEIP1271_wallet2 = new ethers.Contract(
      DEPLOYED_EIP1271_WHITELIST_CONTRACT,
      WhitelistEIP1271.abi,
      wallet2
    );

    const messageHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("The answer to the universe is 42.")
    );

    console.log("🔄 Signing message with EIP-1271 Wallet #1...");
    const wallet1Signature = wallet1._signingKey().signDigest(messageHash);
    const wallet1SignatueTx = await whitelistEIP1271_wallet1.signTx(
      messageHash,
      ethers.utils.joinSignature(wallet1Signature)
    );
    const wallet1SignatueTxReceipt = await wallet1SignatueTx.wait();
    console.log(
      `✅ Signed message with EIP-1271 Wallet #1. Transaction hash: ${wallet1SignatueTxReceipt.hash}`
    );

    console.log("🔄 Signing message with EIP-1271 Wallet #2...");
    const wallet2Signature = wallet2._signingKey().signDigest(messageHash);
    const wallet2SignatureTx = await whitelistEIP1271_wallet2.signTx(
      messageHash,
      ethers.utils.joinSignature(wallet2Signature)
    );
    const wallet2SignatureTxReceipt = await wallet2SignatureTx.wait();
    console.log(
      `✅ Signed message with EIP-1271 Wallet #2. Transaction hash: ${wallet2SignatureTxReceipt.hash}`
    );

    console.log("🔄 Getting combined signature for signed message...");
    const combinedSignatures = await whitelistEIP1271_wallet1.signatures(
      messageHash
    );
    console.log("✅ Got combined message signature");

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersSigner,
        capacityTokenId,
        delegateeAddresses: [pkpInfo.ethAddress],
        uses: "1",
      });
    console.log(`✅ Created the capacityDelegationAuthSig`);

    console.log(
      `🔄 Getting the Session Sigs for the PKP using Lit Action: ${LIT_ACTION_IPFS_CID}...`
    );
    const sessionSignatures = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: pkpInfo.publicKey,
      capabilityAuthSigs: [capacityDelegationAuthSig],
      litActionIpfsId: LIT_ACTION_IPFS_CID,
      jsParams: {
        eip1271MessageHash: messageHash,
        eip1271CombinedSignatures: combinedSignatures,
      },
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log(
      `✅ Got PKP Session Sigs: ${JSON.stringify(sessionSignatures, null, 2)}`
    );

    return sessionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
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
