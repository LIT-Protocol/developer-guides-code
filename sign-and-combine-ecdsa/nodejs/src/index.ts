import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNetwork, LIT_RPC, LIT_CHAINS } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";

import { getEnv } from "./utils";
import { litActionCode } from "./litAction";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
let capacityTokenId = getEnv("CAPACITY_TOKEN_ID");
let LIT_PKP_PUBLIC_KEY = getEnv("LIT_PKP_PUBLIC_KEY");
let LIT_PKP_ETH_ADDRESS = getEnv("LIT_PKP_ETH_ADDRESS");


const chain = "sepolia";
const rpcUrl = LIT_CHAINS[chain].rpcUrls[0];
const chainId = LIT_CHAINS[chain].chainId;

const ethersWallet = new ethers.Wallet(
  ETHEREUM_PRIVATE_KEY,
  new ethers.providers.JsonRpcProvider(rpcUrl)
);

const ethersProvider = new ethers.providers.JsonRpcProvider(rpcUrl);

export const signAndCombineAndSendTx = async () => {
  let litNodeClient: LitNodeClient;

  const yellowstoneEthersWallet = new ethers.Wallet(
    ETHEREUM_PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
  );
  const litContracts = new LitContracts({
    signer: yellowstoneEthersWallet,
    network: LitNetwork.DatilTest,
    debug: false,
  });

  await litContracts.connect();

  try {
    let mintedPkp;
    console.log("🔄 Checking if PKP was given...");
    if (LIT_PKP_PUBLIC_KEY === undefined || LIT_PKP_PUBLIC_KEY === "") {
      console.log("PKP not given, minting a new PKP");

      mintedPkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
      LIT_PKP_PUBLIC_KEY = mintedPkp.publicKey;
      LIT_PKP_ETH_ADDRESS = mintedPkp.ethAddress.slice(2);
      console.log("Minted a new PKP", mintedPkp);
    }
    console.log("✅ PKP successfully minted/given");

    const fundPKP = async () => {
      const tx = {
        to: "0x" + LIT_PKP_ETH_ADDRESS,
        value: ethers.utils.parseEther("0.0001"),
        gasLimit: 21_000,
        gasPrice: (await ethersWallet.getGasPrice()).toHexString(),
        nonce: await ethersProvider.getTransactionCount(ethersWallet.address),
        chainId,
      };

      const signedTx = await ethersWallet.signTransaction(tx);
      const sendTx = await ethersProvider.sendTransaction(signedTx);
      const receipt = await sendTx.wait();
    };

    let bal = await ethersProvider.getBalance(LIT_PKP_ETH_ADDRESS!);
    let formattedBal = ethers.utils.formatEther(bal);
    console.log("💰 PKP balance: ", formattedBal);

    if (Number(formattedBal) < Number(ethers.utils.formatEther(25_000))) {
      console.log("💰 Funding PKP...");
      await fundPKP();
      console.log("✅ PKP funded");
      bal = await ethersProvider.getBalance(LIT_PKP_ETH_ADDRESS!);
      formattedBal = ethers.utils.formatEther(bal);
      console.log("💰 PKP balance: ", formattedBal);
    }

    console.log("🔄 Initializing connection to the Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilTest,
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
      nonce: await ethersProvider.getTransactionCount(LIT_PKP_ETH_ADDRESS!),
      chainId,
    };
    console.log(unsignedTransaction);

    const unsignedTransactionHash = ethers.utils.keccak256(
      ethers.utils.serializeTransaction(unsignedTransaction)
    );
    console.log("✅ Transaction created and serialized");

    if (capacityTokenId === "" || capacityTokenId=== undefined) {
      console.log("🔄 Minting Capacity Credits NFT...");
      capacityTokenId = (
        await litContracts.mintCapacityCreditsNFT({
          requestsPerKilosecond: 10,
          daysUntilUTCMidnightExpiration: 1,
        })
      ).capacityTokenIdStr;
      console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    }

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersWallet,
        capacityTokenId,
        delegateeAddresses: [ethersWallet.address],
        uses: "1",
      });

    console.log("🔄 Attempting to execute the Lit Action code...");
    const result = await litNodeClient.executeJs({
      sessionSigs: await litNodeClient.getSessionSigs({
        chain: chain,
        capabilityAuthSigs: [capacityDelegationAuthSig],
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
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
        publicKey: LIT_PKP_PUBLIC_KEY,
        sigName: "signedTransaction",
        chain,
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
