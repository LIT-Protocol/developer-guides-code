import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LIT_NETWORK, LIT_RPC, LIT_ABILITY } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  LitActionResource,
  LitPKPResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";

import { getChainInfo, getEnv } from "./utils";
import { litActionCode } from "./litAction";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const SELECTED_LIT_NETWORK = LIT_NETWORK.Datil;
const LIT_CAPACITY_CREDIT_TOKEN_ID = getEnv("LIT_CAPACITY_CREDIT_TOKEN_ID");
const LIT_PKP_PUBLIC_KEY = getEnv("LIT_PKP_PUBLIC_KEY");
const CHAIN_TO_SEND_TX_ON = getEnv("CHAIN_TO_SEND_TX_ON");

export const signAndCombineAndSendTx = async () => {
  let litNodeClient: LitNodeClient;
  let pkpInfo: {
    tokenId?: string;
    publicKey?: string;
    ethAddress?: string;
  } = {
    publicKey: LIT_PKP_PUBLIC_KEY,
  };

  try {
    const chainInfo = getChainInfo(CHAIN_TO_SEND_TX_ON);

    const ethersWallet = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl)
    );

    const ethersProvider = new ethers.providers.JsonRpcProvider(
      chainInfo.rpcUrl
    );

    const yellowstoneEthersWallet = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: yellowstoneEthersWallet,
      network: SELECTED_LIT_NETWORK,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    if (LIT_PKP_PUBLIC_KEY === undefined || LIT_PKP_PUBLIC_KEY === "") {
      console.log("🔄 PKP wasn't provided, minting a new one...");
      pkpInfo = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
      console.log("✅ PKP successfully minted");
      console.log(`ℹ️  PKP token ID: ${pkpInfo.tokenId}`);
      console.log(`ℹ️  PKP public key: ${pkpInfo.publicKey}`);
      console.log(`ℹ️  PKP ETH address: ${pkpInfo.ethAddress}`);
    } else {
      console.log(`ℹ️  Using provided PKP: ${LIT_PKP_PUBLIC_KEY}`);
      pkpInfo = {
        publicKey: LIT_PKP_PUBLIC_KEY,
        ethAddress: ethers.utils.computeAddress(`0x${LIT_PKP_PUBLIC_KEY}`),
      };
    }

    console.log(`🔄 Checking PKP balance...`);
    let bal = await ethersProvider.getBalance(pkpInfo.ethAddress!);
    let formattedBal = ethers.utils.formatEther(bal);

    if (Number(formattedBal) < Number(ethers.utils.formatEther(25_000))) {
      console.log(
        `ℹ️  PKP balance: ${formattedBal} is insufficient to run example`
      );
      console.log(`🔄 Funding PKP...`);

      const fundingTx = {
        to: pkpInfo.ethAddress!,
        value: ethers.utils.parseEther("0.001"),
        gasLimit: 21_000,
        gasPrice: (await ethersWallet.getGasPrice()).toHexString(),
        nonce: await ethersProvider.getTransactionCount(ethersWallet.address),
        chainId: chainInfo.chainId,
      };

      const fundingTxPromise = await ethersWallet.sendTransaction(fundingTx);
      const fundingTxReceipt = await fundingTxPromise.wait();

      console.log(
        `✅ PKP funded. Transaction hash: ${fundingTxReceipt.transactionHash}`
      );
    } else {
      console.log(`✅ PKP has a sufficient balance of: ${formattedBal}`);
    }

    console.log("🔄 Initializing connection to the Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: SELECTED_LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Successfully connected to the Lit network");

    console.log("🔄 Creating and serializing unsigned transaction...");
    const unsignedTransaction = {
      to: ethersWallet.address,
      value: 1,
      gasLimit: 21_000,
      gasPrice: (await ethersWallet.getGasPrice()).toHexString(),
      nonce: await ethersProvider.getTransactionCount(pkpInfo.ethAddress!),
      chainId: chainInfo.chainId,
    };

    const unsignedTransactionHash = ethers.utils.keccak256(
      ethers.utils.serializeTransaction(unsignedTransaction)
    );
    console.log("✅ Transaction created and serialized");

    let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (capacityTokenId === "" || capacityTokenId === undefined) {
      console.log("🔄 No Capacity Credit provided, minting a new one...");
      capacityTokenId = (
        await litContracts.mintCapacityCreditsNFT({
          requestsPerKilosecond: 10,
          daysUntilUTCMidnightExpiration: 1,
        })
      ).capacityTokenIdStr;
      console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    } else {
      console.log(
        `ℹ️  Using provided Capacity Credit with ID: ${LIT_CAPACITY_CREDIT_TOKEN_ID}`
      );
    }

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersWallet,
        capacityTokenId,
        delegateeAddresses: [ethersWallet.address],
        uses: "1",
      });
    console.log("✅ Capacity Delegation Auth Sig created");

    console.log("🔄 Attempting to execute the Lit Action code...");
    const result = await litNodeClient.executeJs({
      sessionSigs: await litNodeClient.getSessionSigs({
        chain: CHAIN_TO_SEND_TX_ON,
        capabilityAuthSigs: [capacityDelegationAuthSig],
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
        resourceAbilityRequests: [
          {
            resource: new LitPKPResource("*"),
            ability: LIT_ABILITY.PKPSigning,
          },
          {
            resource: new LitActionResource("*"),
            ability: LIT_ABILITY.LitActionExecution,
          },
        ],
        authNeededCallback: async ({
          resourceAbilityRequests,
          expiration,
          uri,
        }) => {
          const toSign = await createSiweMessageWithRecaps({
            uri: uri!,
            expiration: expiration!,
            resources: resourceAbilityRequests!,
            walletAddress: ethersWallet.address,
            nonce: await litNodeClient.getLatestBlockhash(),
            litNodeClient,
          });

          return await generateAuthSig({
            signer: ethersWallet,
            toSign,
          });
        },
      }),
      code: litActionCode,
      jsParams: {
        toSign: ethers.utils.arrayify(unsignedTransactionHash),
        publicKey: pkpInfo.publicKey!,
        sigName: "signedTransaction",
        chain: CHAIN_TO_SEND_TX_ON,
        unsignedTransaction,
      },
    });
    console.log("✅ Lit Action code executed successfully");
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
