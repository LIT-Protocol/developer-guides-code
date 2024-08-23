import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  AuthMethodScope,
  AuthMethodType,
  LitNetwork,
  LIT_RPC,
} from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";
import bs58 from "bs58";
import { LitAbility, LitPKPResource } from "@lit-protocol/auth-helpers";
// @ts-ignore
import IpfsHash from "ipfs-only-hash";

import { getEnv, getPkpInfoFromMintReceipt } from "./utils";
import { litActionCode } from "./litAction";
import WhitelistEIP1271 from "./WhitelistEIP1271.json";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const ANVIL_PRIVATE_KEY_1 = getEnv("ANVIL_PRIVATE_KEY_1");
const ANVIL_PRIVATE_KEY_2 = getEnv("ANVIL_PRIVATE_KEY_2");
const DEPLOYED_EIP1271_WHITELIST_CONTRACT = getEnv(
  "DEPLOYED_EIP1271_WHITELIST_CONTRACT"
);
const LIT_CAPACITY_CREDIT_TOKEN_ID = process.env.LIT_CAPACITY_CREDIT_TOKEN_ID;
const LIT_NETWORK = LitNetwork.DatilTest;
const LIT_RPC_URL = LIT_RPC.CHRONICLE_YELLOWSTONE;

export const runExample = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC_URL)
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

    console.log("🔄 Calculating the IPFS CID for Lit Action code string...");
    const litActionIpfsCid = await IpfsHash.of(litActionCode);
    console.log(
      `✅ Calculated IPFS CID: ${litActionIpfsCid}. Hexlified version: 0x${Buffer.from(
        bs58.decode(litActionIpfsCid)
      ).toString("hex")}`
    );

    console.log("🔄 Minting new PKP...");
    console.log(
      `0x${Buffer.from(bs58.decode(litActionIpfsCid)).toString("hex")}`
    );
    const tx =
      await litContracts.pkpHelperContract.write.mintNextAndAddAuthMethods(
        AuthMethodType.LitAction, // keyType
        [AuthMethodType.LitAction], // permittedAuthMethodTypes
        [`0x${Buffer.from(bs58.decode(litActionIpfsCid)).toString("hex")}`], // permittedAuthMethodIds
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
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (capacityTokenId === "" || capacityTokenId === undefined) {
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

    const provider = new ethers.providers.JsonRpcProvider(LIT_RPC_URL);

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

    const balanceThreshold = ethers.utils.parseEther("0.0001");

    console.log(`🔄 Checking balance for Wallet 1: ${wallet1.address}...`);
    const wallet1Balance = await ethersSigner.provider.getBalance(
      wallet1.address
    );
    if (wallet1Balance.lt(balanceThreshold)) {
      console.log("❗️ Wallet 1 has an insufficient balance, funding...");
      const tx = await ethersSigner.sendTransaction({
        to: wallet1.address,
        value: balanceThreshold.sub(wallet1Balance),
      });
      await tx.wait();
      console.log(`✅ Funded wallet. TX hash: ${tx.hash}`);
    } else {
      console.log("✅ Wallet 1 has a sufficient balance");
    }

    console.log(`🔄 Checking balance for Wallet 2: ${wallet2.address}...`);
    const wallet2Balance = await ethersSigner.provider.getBalance(
      wallet2.address
    );
    if (wallet2Balance.lt(balanceThreshold)) {
      console.log("❗️ Wallet 2 has an insufficient balance, funding...");
      const tx = await ethersSigner.sendTransaction({
        to: wallet2.address,
        value: balanceThreshold.sub(wallet2Balance),
      });
      await tx.wait();
      console.log(`✅ Funded wallet. TX hash: ${tx.hash}`);
    } else {
      console.log("✅ Wallet 2 has a sufficient balance");
    }

    console.log("🔄 Signing message with EIP-1271 Wallet #1...");
    const wallet1Signature = wallet1._signingKey().signDigest(messageHash);
    const wallet1SignatueTx = await whitelistEIP1271_wallet1.signTx(
      messageHash,
      ethers.utils.joinSignature(wallet1Signature)
    );
    const wallet1SignatueTxReceipt = await wallet1SignatueTx.wait();
    console.log(
      `✅ Signed message with EIP-1271 Wallet #1. Transaction hash: ${wallet1SignatueTxReceipt.transactionHash}`
    );

    console.log("🔄 Signing message with EIP-1271 Wallet #2...");
    const wallet2Signature = wallet2._signingKey().signDigest(messageHash);
    const wallet2SignatureTx = await whitelistEIP1271_wallet2.signTx(
      messageHash,
      ethers.utils.joinSignature(wallet2Signature)
    );
    const wallet2SignatureTxReceipt = await wallet2SignatureTx.wait();
    console.log(
      `✅ Signed message with EIP-1271 Wallet #2. Transaction hash: ${wallet2SignatureTxReceipt.transactionHash}`
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
      `🔄 Getting the Session Sigs for the PKP using Lit Action: ${litActionIpfsCid}...`
    );
    const sessionSignatures = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: pkpInfo.publicKey,
      capabilityAuthSigs: [capacityDelegationAuthSig],
      litActionCode: Buffer.from(litActionCode).toString("base64"),
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
    console.log("✅ Got PKP Session Sigs");

    return sessionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
