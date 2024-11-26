import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  LIT_RPC,
  LIT_CHAINS,
  LIT_ABILITY,
  LIT_NETWORK,
} from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  LitActionResource,
  LitPKPResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";

import { getChainInfo, getEnv } from "./utils";
import { litActionCode } from "./litAction";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const LIT_NET = LIT_NETWORK.DatilDev;
const LIT_PKP_PUBLIC_KEY = getEnv("LIT_PKP_PUBLIC_KEY");
const CHAIN_TO_SEND_TX_ON = getEnv("CHAIN_TO_SEND_TX_ON");

export const signAndCombineAndSendTx = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const chainInfo = getChainInfo(CHAIN_TO_SEND_TX_ON);

    const ethersWallet = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl)
    );

    const yellowstoneEthersWallet = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: yellowstoneEthersWallet,
      network: LIT_NET,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    console.log("🔄 Initializing connection to the Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NET,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Successfully connected to the Lit network");

    console.log("✅ Transaction created and serialized");

    const authMethod = await EthWalletProvider.authenticate({
      signer: ethersWallet,
      litNodeClient,
    });

    const sessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: LIT_PKP_PUBLIC_KEY,
      authMethods: [authMethod],
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
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });

    console.log("🔄 Executing Lit Action...");

    const routerAddress = "0x2626664c2603336E57B271c5C0b26F421741e481";
    const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    const WETH = "0x4200000000000000000000000000000000000006";
    const fee = 5000;
    
    // Compute PKP address
    console.log("PKP Public Key:", LIT_PKP_PUBLIC_KEY);
    const pkpAddress = ethers.utils.computeAddress(`0x${LIT_PKP_PUBLIC_KEY}`);
    console.log("PKP Address:", pkpAddress);

    
 
    // Setup contracts
    const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
    const swapRouter = new ethers.Contract(routerAddress, [
        "function exactInput(tuple(bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum)) external payable returns (uint256 amountOut)",
    ], provider);
    const USDCContract = new ethers.Contract(USDC, [
        "function approve(address spender, uint256 amount) external returns (bool)",
    ], provider);
 
    console.log("Contracts initialized");

    const pkpBalance = await provider.getBalance(pkpAddress);
    console.log("PKP Balance:", ethers.utils.formatEther(pkpBalance), "ETH");
 
        // Prepare swap parameters
        const amountIn = ethers.utils.parseUnits("5", 6);
        const path = ethers.utils.solidityPack(
            ["address", "uint24", "address"],
            [USDC, fee, WETH]
        );
        console.log("Swap amount:", ethers.utils.formatUnits(amountIn, 6), "USDC");
 
        // Build approval transaction
        const gasPrice = await provider.getGasPrice();
        console.log("Current gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");
        
        const nonce = await provider.getTransactionCount(pkpAddress);
        console.log("Current nonce:", nonce);
 
        const unsignedApprovalTx = {
            to: USDC,
            data: USDCContract.interface.encodeFunctionData("approve", [routerAddress, amountIn]),
            gasLimit: ethers.utils.hexlify(75000),
            gasPrice: ethers.utils.hexlify(gasPrice),
            nonce: nonce,
            chainId: 8453,
            value: 0
        };
        console.log("Approval transaction created");
 
        // Sign approval
        const approvalToSign = ethers.utils.arrayify(ethers.utils.keccak256(
            ethers.utils.serializeTransaction(unsignedApprovalTx)
        ));
        console.log("Approval hash created, signing with PKP...");
 
        const signedApprovalTx = await litNodeClient.pkpSign({
            sessionSigs,
            pubKey: LIT_PKP_PUBLIC_KEY,
            toSign: approvalToSign
        });
        console.log("Approval signed by PKP");
 
        // Format approval signature
        const approvalSig = {
          r: '0x' + signedApprovalTx.signature.substring(2, 66), // Skip the first '0x'
          s: '0x' + signedApprovalTx.signature.substring(66, 130),
          v: parseInt(signedApprovalTx.signature.substring(130, 132), 16)
      };
        console.log("Approval signature formatted");
        console.log("Approval signature:", approvalSig);
 
        // Send approval
        const approvalFullTx = ethers.utils.serializeTransaction(unsignedApprovalTx, approvalSig);
        console.log("Sending approval transaction...");
        const approvalReceipt = await provider.sendTransaction(approvalFullTx);
        console.log("Approval transaction sent:", approvalReceipt.hash);
        
        console.log("Waiting for approval confirmation...");
        await approvalReceipt.wait();
        console.log("Approval confirmed");
 
        // Build swap transaction
        const unsignedSwapTx = {
          to: routerAddress,
          data: swapRouter.interface.encodeFunctionData("exactInput", [{
              path: path,
              recipient: "0x93907a09Fd77D4914Aa8bDDE57Bb678B427591D8", // Your PKP address
              deadline: Math.floor(Date.now() / 1000) + 60 * 20,
              amountIn: amountIn,
              amountOutMinimum: 0
          }]),
          gasLimit: ethers.utils.hexlify(300000), // Increased gas limit
          gasPrice: ethers.utils.hexlify(await provider.getGasPrice()),
          nonce: await provider.getTransactionCount(pkpAddress),
          chainId: 8453,
          value: 0
      };
      
      // Let's also add debug logging
      console.log("Swap Parameters:", {
          path: path,
          recipient: pkpAddress,
          deadline: Math.floor(Date.now() / 1000) + 60 * 20,
          amountIn: amountIn.toString(),
          amountOutMinimum: 0
      });
      
 
        // Sign swap
        const swapToSign = ethers.utils.arrayify(ethers.utils.keccak256(
            ethers.utils.serializeTransaction(unsignedSwapTx)
        ));
        console.log("Swap hash created, signing with PKP...");
 
        const signedSwapTx = await litNodeClient.pkpSign({
            sessionSigs,
            pubKey: LIT_PKP_PUBLIC_KEY,
            toSign: swapToSign
        });
        console.log("Swap signed by PKP");
 
        // Format swap signature
        const swapSig = {
            r: '0x' + signedSwapTx.signature.substring(2, 66),
            s: '0x' + signedSwapTx.signature.substring(66, 130),
            v: parseInt(signedSwapTx.signature.substring(130, 132), 16)
        };
        console.log("Swap signature formatted");
 
        // Send swap
        const swapFullTx = ethers.utils.serializeTransaction(unsignedSwapTx, swapSig);
        console.log("Sending swap transaction...");
        const swapReceipt = await provider.sendTransaction(swapFullTx);
        console.log("Swap transaction sent:", swapReceipt.hash);

    console.log("✅ Lit Action code executed successfully");
    return swapReceipt;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
