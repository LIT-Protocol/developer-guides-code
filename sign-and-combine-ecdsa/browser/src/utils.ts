import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LIT_CHAINS, LitNetwork } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

export const connectLitNodeClient = async (litNetwork: LitNetwork) => {
  console.log(`🔄 Initializing connection to the ${litNetwork} Lit network...`);
  const litNodeClient = new LitNodeClient({
    litNetwork: litNetwork,
    debug: false,
  });
  await litNodeClient.connect();
  console.log(`✅ Successfully connected to the ${litNetwork} Lit network`);
  return litNodeClient;
};

export const connectLitContractsClient = async (
  ethersSigner: ethers.providers.JsonRpcSigner,
  litNetwork: LitNetwork
) => {
  console.log(`🔄 Connecting LitContracts client to ${litNetwork} network...`);
  const litContracts = new LitContracts({
    signer: ethersSigner,
    network: litNetwork,
  });
  await litContracts.connect();
  console.log(`✅ Connected LitContracts client to ${litNetwork} network`);
  return litContracts;
};

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

export const getEthersSigner = async () => {
  console.log("🔄 Connecting to Ethereum account...");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const ethersSigner = provider.getSigner();
  console.log(
    "✅ Connected Ethereum account:",
    await ethersSigner.getAddress()
  );
  return ethersSigner;
};

export const mintPkp = async (
  ethersSigner: ethers.providers.JsonRpcSigner,
  litNetwork: LitNetwork
) => {
  try {
    const litContracts = await connectLitContractsClient(
      ethersSigner,
      litNetwork
    );

    console.log("🔄 Minting new PKP...");
    const pkpInfo = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
    console.log("✅ PKP successfully minted");
    console.log(`ℹ️  PKP token ID: ${pkpInfo.tokenId}`);
    console.log(`ℹ️  PKP public key: ${pkpInfo.publicKey}`);
    console.log(`ℹ️  PKP ETH address: ${pkpInfo.ethAddress}`);
    return pkpInfo;
  } catch (error) {
    console.error(error);
  }
};

export const getPkpBalance = async (
  ethersSigner: ethers.providers.JsonRpcSigner,
  chainInfo: { rpcUrl: string; chainId: number },
  pkpInfo: { ethAddress: string }
) => {
  console.log(`🔄 Checking PKP balance...`);
  let bal = await ethersSigner.provider.getBalance(pkpInfo.ethAddress!);
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
      gasPrice: (await ethersSigner.getGasPrice()).toHexString(),
      nonce: await ethersSigner.provider.getTransactionCount(
        await ethersSigner.getAddress()
      ),
      chainId: chainInfo.chainId,
    };

    const fundingTxPromise = await ethersSigner.sendTransaction(fundingTx);
    const fundingTxReceipt = await fundingTxPromise.wait();

    console.log(
      `✅ PKP funded. Transaction hash: ${fundingTxReceipt.transactionHash}`
    );
  }
};

export const getHashSerializedUnsignedTransaction = async (
  ethersSigner: ethers.providers.JsonRpcSigner,
  chainInfo: { rpcUrl: string; chainId: number },
  pkpInfo: { ethAddress: string }
) => {
  console.log("🔄 Creating and serializing unsigned transaction...");
  const unsignedTransaction = {
    to: await ethersSigner.getAddress(),
    value: 1,
    gasLimit: 21_000,
    gasPrice: (await ethersSigner.getGasPrice()).toHexString(),
    nonce: await ethersSigner.provider.getTransactionCount(pkpInfo.ethAddress!),
    chainId: chainInfo.chainId,
  };

  const unsignedTransactionHash = ethers.utils.keccak256(
    ethers.utils.serializeTransaction(unsignedTransaction)
  );
  console.log("✅ Transaction created and serialized");
  return unsignedTransactionHash;
};

export const mintCapacityCredit = async (
  ethersSigner: ethers.providers.JsonRpcSigner,
  litNetwork: LitNetwork
) => {
  try {
    console.log(
      `🔄 Connecting LitContracts client to the ${litNetwork} Lit network...`
    );
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: litNetwork,
    });
    await litContracts.connect();
    console.log(
      `✅ Connected LitContracts client to the ${litNetwork} Lit network`
    );

    console.log("🔄 Minting new Capacity Credit...");
    const capacityTokenId = (
      await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 30,
      })
    ).capacityTokenIdStr;
    console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    return capacityTokenId;
  } catch (error) {
    console.error(error);
  }
};

export const createCapacityDelegationAuthSig = async (
  litNodeClient: LitNodeClient,
  ethersWallet: ethers.providers.JsonRpcSigner,
  capacityTokenId: string
) => {
  console.log("🔄 Creating capacityDelegationAuthSig...");
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: ethersWallet,
      capacityTokenId,
      delegateeAddresses: [await ethersWallet.getAddress()],
      uses: "1",
    });
  console.log("✅ Capacity Delegation Auth Sig created");
  return capacityDelegationAuthSig;
};
