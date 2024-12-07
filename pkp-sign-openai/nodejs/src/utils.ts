import { ethers, ContractFactory } from "ethers";
import { LIT_CHAINS } from "@lit-protocol/constants";
import PKPPermissionsArtifact from "../artifacts/contracts/PKPPermissions.sol/PKPPermissions.json";
import Safe from '@safe-global/protocol-kit';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Add this type definition at the top
type PermittedAction = {
  cid: string;
  permitted: boolean;
  description: string;
};

export async function analyzeUserIntentAndMatchAction(
  userIntent: string, 
  pkpPermissions: ethers.Contract,
  provider: ethers.providers.Provider
) {
  try {
    // First get all permitted actions from the contract
    const rawActions = await getPermittedActions(provider, pkpPermissions.address);
    
    // Transform the raw data into a more usable format
    const permittedActions: PermittedAction[] = rawActions.cids.map((cid: string, index: number) => ({
      cid,
      permitted: rawActions.permissions[index],
      description: rawActions.descriptions[index]
    }));
    
    console.log("Permitted Actions:", permittedActions);
    
    // Get AI analysis of the user intent
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a web3 transaction analyzer. Given a user's intent and a list of available actions, analyze the intent and match it with the most appropriate action.
          Available actions:
          ${permittedActions.map((action: PermittedAction) => 
            `- CID: ${action.cid}\n  Description: ${action.description}`
          ).join('\n')}
          
          Return a JSON response with:
          1. type: The type of transaction (send, swap, etc)
          2. amount: The amount involved (if applicable)
          3. details: Additional relevant details
          4. recommendedCID: The CID of the most appropriate action for this intent (must be one of the listed CIDs)
          Only respond with valid JSON.`
        },
        {
          role: "user",
          content: userIntent
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Find the matched action from the permitted actions
    const matchedAction = permittedActions.find((action: PermittedAction) => 
      action.cid === analysis.recommendedCID && action.permitted
    );

    return {
      analysis,
      matchedAction: matchedAction || null
    };
  } catch (error) {
    console.error("Error analyzing intent:", error);
    throw error;
  }
}

export const getChainInfo = (
    chain: string
  ): { rpcUrl: string; chainId: number } => {
    if (LIT_CHAINS[chain] === undefined)
      throw new Error(`Chain: ${chain} is not supported by Lit`);
  
    return {
      rpcUrl: LIT_CHAINS[chain].rpcUrls[0],
      chainId: LIT_CHAINS[chain].chainId,
    };
  };

export const deployPermissionsContract = async (
  signer: ethers.Wallet,
  safeAddress: string
) => {
  console.log("Deploying new PKPPermissions contract...");
  const PKPPermissions = new ContractFactory(
    PKPPermissionsArtifact.abi,
    PKPPermissionsArtifact.bytecode,
    signer
  );
  const pkpPermissions = await PKPPermissions.deploy(safeAddress);
  await pkpPermissions.deployTransaction.wait();
  return pkpPermissions;
};

export const addPermittedAction = async (
  protocolKit: Safe,
  pkpPermissions: ethers.Contract,
  ipfsCid: string,
  description: string
) => {
  const pkpPermissionsInterface = new ethers.utils.Interface(PKPPermissionsArtifact.abi);
  const setPermittedActionData = pkpPermissionsInterface.encodeFunctionData(
    "setPermittedAction",
    [ipfsCid, true, description]
  );

  const safeTransaction = await protocolKit.createTransaction({
    transactions: [{
      to: pkpPermissions.address,
      value: '0',
      data: setPermittedActionData,
      operation: 0
    }]
  });
  return safeTransaction;
};

export const getPermittedActions = async (
  provider: ethers.providers.Provider,
  contractAddress: string
) => {
  const pkpPermissions = new ethers.Contract(
    contractAddress,
    PKPPermissionsArtifact.abi,
    provider
  );
  return await pkpPermissions.getAllPermittedActions();
};

export const signAndExecuteSafeTransaction = async (
  protocolKit: Safe,
  safeTransaction: any,
  firstOwnerPrivateKey: string,
  secondOwnerPrivateKey: string,
  provider: ethers.providers.Provider,
  sepoliaRpcUrl: string
) => {
  // Sign with first owner
  console.log("Signing with first owner...");
  protocolKit = await protocolKit.connect({
    provider: sepoliaRpcUrl,
    signer: firstOwnerPrivateKey
  });
  safeTransaction = await protocolKit.signTransaction(
    safeTransaction,
    "eth_sign"
  );
  console.log("Transaction after first signature:", safeTransaction);

  // Sign with second owner
  console.log("Signing with second owner...");
  protocolKit = await protocolKit.connect({
    provider: sepoliaRpcUrl,
    signer: secondOwnerPrivateKey
  });
  safeTransaction = await protocolKit.signTransaction(
    safeTransaction,
    "eth_signTypedData_v4"
  );
  console.log("Transaction after second signature:", safeTransaction);

  // Execute the fully signed transaction
  console.log("Executing transaction from Safe...");
  const txResponse = await protocolKit.executeTransaction(safeTransaction);
  const receipt = await provider.waitForTransaction(txResponse.hash);
  return receipt;
};

export const deploySafe = async (
  protocolKit: Safe,
  provider: ethers.providers.Provider,
  chain: any
) => {
  const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction();
  const client = await protocolKit.getSafeProvider().getExternalSigner();
  const txHash = await client!.sendTransaction({
    to: deploymentTransaction.to,
    value: BigInt(deploymentTransaction.value),
    data: deploymentTransaction.data as `0x${string}`,
    chain
  });

  const txReceipt = await provider.waitForTransaction(txHash);
  console.log("Safe deployed, tx receipt:", txReceipt);
  return txReceipt;
};

export const logPermittedActions = async (
  provider: ethers.providers.Provider,
  contractAddress: string
) => {
  const [cids, permissions, descriptions] = await getPermittedActions(provider, contractAddress);
  console.log("\nPermitted IPFS CIDs:");
  cids.forEach((cid: string, index: number) => {
    console.log(`CID: ${cid}`);
    console.log(`Permitted: ${permissions[index]}`);
    console.log(`Description: ${descriptions[index]}`);
    console.log('---');
  });
  return { cids, permissions, descriptions };
};

export const removeAllPermittedActions = async (
  protocolKit: Safe,
  pkpPermissions: ethers.Contract,
  provider: ethers.providers.Provider
) => {
  try {
    // Create transaction data to remove all permitted actions
    const pkpPermissionsInterface = new ethers.utils.Interface(PKPPermissionsArtifact.abi);
    const removeAllData = pkpPermissionsInterface.encodeFunctionData("removeAllPermittedActions", []);

    // Create the transaction
    const safeTransaction = await protocolKit.createTransaction({
      transactions: [{
        to: pkpPermissions.address,
        value: '0',
        data: removeAllData,
        operation: 0
      }]
    });

    console.log("Created transaction to remove all permitted actions");
    return safeTransaction;
  } catch (error) {
    console.error("Error removing permitted actions:", error);
    throw error;
  }
}; 