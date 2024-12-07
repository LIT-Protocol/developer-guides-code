    //@ts-nocheck
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_ABILITY, AuthMethodScope, LIT_RPC } from "@lit-protocol/constants";
import { LitActionResource, LitPKPResource } from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ipfsHelpers } from "ipfs-helpers";
import { ethers } from "ethers";
import { safeAuthLitActionCode } from "./customLitAction.js";

import Safe from '@safe-global/protocol-kit';
import { sepolia } from 'viem/chains';
import { ContractFactory } from "ethers";
import PKPPermissionsArtifact from "../artifacts/contracts/PKPPermissions.sol/PKPPermissions.json";
import { deployPermissionsContract, addPermittedAction, getPermittedActions, getChainInfo } from "./utils";
import { signAndExecuteSafeTransaction } from "./utils";
import { logPermittedActions } from "./utils";
import { analyzeUserIntentAndMatchAction } from "./utils";
import { removeAllPermittedActions } from "./utils";
import { litActionCode } from "./litActionCode";

export const createSafePKP = async () => {
  const litNodeClient = new LitNodeClient({
    litNetwork: LIT_NETWORK.DatilDev,
    debug: false,
  });

  try {
    const sepoliaRpcUrl = "https://rpc.ankr.com/eth_sepolia";
    const firstOwnerPrivateKey = process.env.ETHEREUM_PRIVATE_KEY!;
    const secondOwnerPrivateKey = process.env.ETHEREUM_SECOND_OWNER_KEY!;

    const provider = new ethers.providers.JsonRpcProvider(sepoliaRpcUrl);
    const firstOwnerWallet = new ethers.Wallet(firstOwnerPrivateKey, provider);
    const secondOwnerWallet = new ethers.Wallet(secondOwnerPrivateKey, provider);

    await litNodeClient.connect();
    console.log("Connected to Lit network");

    const predictedSafe = {
      safeAccountConfig: {
        owners: [firstOwnerWallet.address, secondOwnerWallet.address],
        threshold: 2
      },
      // You can add safeDeploymentConfig if needed
    };

    // Use Safe.create() for v5
    let protocolKit = await Safe.default.init({
      provider: sepoliaRpcUrl,
      signer: firstOwnerPrivateKey,
      predictedSafe
    });

    const safeAddress = await protocolKit.getAddress();
    console.log("Predicted Safe address:", safeAddress);

    // Optional: Deploy Safe if needed using deploySafe() from utils.ts
    
    // Reconnect the protocolKit to the newly deployed Safe
    protocolKit = await protocolKit.connect({ safeAddress });

    console.log('Is Safe deployed:', await protocolKit.isSafeDeployed());
    console.log('Safe Address:', await protocolKit.getAddress());
    console.log('Safe Owners:', await protocolKit.getOwners());
    console.log('Safe Threshold:', await protocolKit.getThreshold());

    // Initialize Lit Contracts
    const ownerOnYellowstone = new ethers.Wallet(firstOwnerPrivateKey, new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE));
    const litContracts = new LitContracts({
      signer: ownerOnYellowstone,
      network: LIT_NETWORK.DatilDev,
    });
    await litContracts.connect();

    // Mint PKP
    /*
    console.log("Minting PKP...");
    const mintResult = await litContracts.pkpNftContractUtils.write.mint();
    const pkp = mintResult.pkp;
    console.log("PKP minted:", {
      tokenId: pkp.tokenId,
      publicKey: pkp.publicKey,
      ethAddress: pkp.ethAddress
    })*/

      const pkp = {
        tokenId: '0xef8491d57c85fa189133d68d0bd0a54d6afdd9a1a3f3c6ff732f276ac43d93a1',
        publicKey: '044a8d48da0a954b50a6e154941e05d28a2cfbc807024125cd269b7938495a757dab789c61dcaaa0189d2dc34c77359dc17dd3b2d0be9c403a65b3a9af0022e76a',
        ethAddress: '0xfF1BF0617cd1fE2AE48D27D3DD5C8FD109B81640'
      };

/*     // Add permitted Lit Action
    console.log("Adding permitted action to Lit...");
    const ipfsHash = await ipfsHelpers.stringToCidV0(safeAuthLitActionCode);
    await litContracts.addPermittedAction({
      ipfsId: ipfsHash,
      pkpTokenId: pkp.tokenId,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });

    // Transfer PKP to the deployed Safe
    console.log("Transferring PKP to Safe...");
    const transferTx = await litContracts.pkpNftContract.write.transferFrom(
      firstOwnerWallet.address,
      safeAddress,
      pkp.tokenId
    );
    await transferTx.wait();
    console.log("PKP transferred to Safe"); */

    // Verify PKP ownership
    const owner = await litContracts.pkpNftContract.read.ownerOf(pkp.tokenId);
    console.log("Verifying PKP owner:", owner);
    if (owner.toLowerCase() !== safeAddress.toLowerCase()) {
      throw new Error("PKP ownership verification failed");
    }

    const messageToSign = "Auth message: " + Date.now().toString();

    const signature1 = await firstOwnerWallet.signMessage(messageToSign);
    const signature2 = await secondOwnerWallet.signMessage(messageToSign);
    const signatures = [signature1, signature2];

    // Read and log all permitted actions
    const pkpPermissions = new ethers.Contract(
      "0x85D44bB7d10E8794256687aC923f80c9694Fe838",
      PKPPermissionsArtifact.abi,
      provider
    );
    console.log("PKPPermissions deployed to:", pkpPermissions.address);

    console.log("Getting session signatures...");

    // Use the matched action's CID for the session signatures
    const sessionSigs = await litNodeClient.getLitActionSessionSigs({
      pkpPublicKey: pkp.publicKey,
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LIT_ABILITY.LitActionExecution
        },
        {
          resource: new LitPKPResource("*"),
          ability: LIT_ABILITY.PKPSigning
        },
      ],
      litActionCode: Buffer.from(safeAuthLitActionCode).toString("base64"),
      jsParams: {
        pkpPublicKey: pkp.publicKey,
        safeAddress,
        signatures,
        messageToSign
      },
    });

    console.log("Setup complete:", {
      safeAddress,
      pkpTokenId: pkp.tokenId,
      pkpPublicKey: pkp.publicKey,
      pkpEthAddress: pkp.ethAddress
    });

    // Now have the Safe add the initial permitted action
    /*
    const secondCID = "QmT5Vi5byp1vcjE9gkxdWYz3zmScg3BBoM5wnWcUEqXiF7";
    const safeTransaction = await addPermittedAction(
      protocolKit,
      pkpPermissions,
      secondCID,
      "Lit Action for Sending transaction. $1000 Limit."
    );

    // Execute the fully signed transaction
    console.log("Executing transaction from Safe...");
    const receipt = await signAndExecuteSafeTransaction(
      protocolKit,
      safeTransaction,
      firstOwnerPrivateKey,
      secondOwnerPrivateKey,
      provider,
      sepoliaRpcUrl
    );
    console.log("Initial permitted action added by Safe, receipt:", receipt);
    */

    const userIntent = "I want to send 500 USDC to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const { analysis, matchedAction } = await analyzeUserIntentAndMatchAction(
      userIntent,
      pkpPermissions,
      provider
    );
    
    console.log("Analyzed Intent:", analysis);
    console.log("Matched Lit Action:", matchedAction);

    await addPermittedAction(protocolKit, pkpPermissions, "QmU9GbJ3z46gJrM8eZVgzvqjkbU3SkrNzgCBDNdBKRToTi", `A Lit Action that requires a recipient address, value amount, and chain information to execute an Ethereum transaction. The AI must provide:
chainInfo: { rpcUrl, chainId } - network details for transaction execution
recipientAddress - destination address for the transaction
value - amount to send in wei
pkpEthAddress - the PKP's Ethereum address
publicKey - the PKP's public key
The action signs and submits the transaction using the PKP's credentials and returns the transaction hash. Currently configured for the Yellowstone testnet.`);

 /*    if (!matchedAction) {
      throw new Error("No suitable Lit Action found for this intent");
    } */

    // First, create the Lit Action code as a function

    // Use it in your executeJs call
    const executeIntent = await litNodeClient.executeJs({
      sessionSigs,
      //code: litActionCode,
      ipfsId: "QmU9GbJ3z46gJrM8eZVgzvqjkbU3SkrNzgCBDNdBKRToTi",
      jsParams: {
        recipientAddress: analysis.recipientAddress,
        value: analysis.value,
        chainInfo: getChainInfo("yellowstone"),
        publicKey: pkp.publicKey,
        pkpEthAddress: pkp.ethAddress
      }
    });

    console.log("Executed Intent:", executeIntent);

    return {
      safeAddress,
      pkp,
      sessionSigs,
      messageToSign
    };

  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
