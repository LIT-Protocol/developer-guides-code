import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  AuthMethodScope,
  AuthMethodType,
  LIT_RPC,
  LitNetwork,
} from "@lit-protocol/constants";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { ethers } from "ethers";
// @ts-ignore
import IpfsHash from "ipfs-only-hash";

import { getEnv } from "./utils";
import { generateSessionSigs } from "./litActions/generateSessionSigs";
import { signEthTransaction } from "./litActions/signEthTransaction";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const SEPOLIA_RPC_URL = getEnv("SEPOLIA_RPC_URL");
const LIT_NETWORK = LitNetwork.DatilDev;

export const runExample = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSignerYellowstone = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );
    const ethersSignerSepolia = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL)
    );

    console.log(
      "🔄 Calculating the IPFS CID for generate Session Sigs Lit Action code string..."
    );
    const generateSessionSigsLitActionIpfsCid = await IpfsHash.of(
      generateSessionSigs
    );
    console.log(
      `✅ Calculated IPFS CID: ${generateSessionSigsLitActionIpfsCid}. Hexlified version: 0x${Buffer.from(
        ethers.utils.base58.decode(generateSessionSigsLitActionIpfsCid)
      ).toString("hex")}`
    );

    console.log(
      "🔄 Calculating the IPFS CID for sign Ethereum Transaction Lit Action code string..."
    );
    const signEthTransactionLitActionIpfsCid = await IpfsHash.of(
      signEthTransaction
    );
    console.log(
      `✅ Calculated IPFS CID: ${signEthTransactionLitActionIpfsCid}. Hexlified version: 0x${Buffer.from(
        ethers.utils.base58.decode(signEthTransactionLitActionIpfsCid)
      ).toString("hex")}`
    );

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSignerYellowstone,
      network: LIT_NETWORK,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    console.log("🔄 Getting PKP mint cost...");
    const pkpMintCost = await litContracts.pkpNftContract.read.mintCost();
    console.log("✅ Got PKP mint cost");

    console.log("🔄 Minting new PKP...");
    const tx =
      await litContracts.pkpHelperContract.write.mintNextAndAddAuthMethods(
        AuthMethodType.LitAction, // keyType
        [AuthMethodType.LitAction, AuthMethodType.LitAction], // permittedAuthMethodTypes
        [
          `0x${Buffer.from(
            ethers.utils.base58.decode(generateSessionSigsLitActionIpfsCid)
          ).toString("hex")}`,
          `0x${Buffer.from(
            ethers.utils.base58.decode(signEthTransactionLitActionIpfsCid)
          ).toString("hex")}`,
        ], // permittedAuthMethodIds
        ["0x", "0x"], // permittedAuthMethodPubkeys
        [[AuthMethodScope.SignAnything], [AuthMethodScope.SignAnything]], // permittedAuthMethodScopes
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

    console.log(
      `🔄 Getting the Session Sigs for the PKP using Lit Action code string...`
    );
    const sessionSignatures = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: pkpInfo.publicKey,
      litActionCode: Buffer.from(generateSessionSigs).toString("base64"),
      jsParams: {},
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log(
      `✅ Got PKP Session Sigs: ${JSON.stringify(sessionSignatures, null, 2)}`
    );

    const txValue = "65000000000000";
    console.log(`🔄 Funding PKP with ${txValue} wei...`);
    const txResponse = await ethersSignerSepolia.sendTransaction({
      to: pkpInfo.ethAddress,
      value: txValue,
    });
    console.log(`📝 Transaction sent. Waiting for confirmation...`);
    const txReceipt = await txResponse.wait(1); // Wait for block confirmation
    console.log(
      `✅ Funded PKP with ${txValue} wei. Tx hash: ${txReceipt.transactionHash}`
    );

    console.log("🔄 Signing Ethereum Transaction...");
    const signedTx = await litNodeClient.executeJs({
      sessionSigs: sessionSignatures,
      code: signEthTransaction,
      jsParams: {
        unsignedTransaction: {
          toAddress: pkpInfo.ethAddress,
          chain: "sepolia",
          value: "0.000000000000000001", // 1 wei
          chainId: 11155111,
          dataHex: "0x",
          gasPrice: ethers.utils.formatUnits(
            (
              await ethersSignerSepolia.getGasPrice()
            ).mul(ethers.BigNumber.from(2)),
            "gwei"
          ),
        },
        broadcast: true,
        pkpPublicKey: pkpInfo.publicKey,
        pkpEthAddress: pkpInfo.ethAddress,
      },
    });
    console.log(
      `✅ Signed Ethereum Transaction: ${JSON.stringify(signedTx, null, 2)}`
    );
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
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
