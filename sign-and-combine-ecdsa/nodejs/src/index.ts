import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";

import { litActionCode } from "./litAction";
import { LitNetwork, LIT_RPC, LIT_CHAINS } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";

const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const ethersWallet = new ethers.Wallet(
  ETHEREUM_PRIVATE_KEY,
  new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

const ethersProvider = new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE);

const LIT_PKP_PUBLIC_KEY = process.env.LIT_PKP_PUBLIC_KEY;
const LIT_PKP_ETH_ADDRESS = process.env.LIT_PKP_ETH_ADDRESS;

export const signAndCombineAndSendTx = async () => {
  let litNodeClient: LitNodeClient;

  try {
    let mintedPkp;
    console.log("🔄 Checking if PKP was given...");
    if (LIT_PKP_PUBLIC_KEY === undefined || LIT_PKP_PUBLIC_KEY == "") {
      console.log("PKP not given, minting a new PKP");
      const litContracts = new LitContracts({
        signer: ethersWallet,
        network: LitNetwork.DatilDev,
        debug: false,
      });

      await litContracts.connect();
      mintedPkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
      console.log("Minted a new PKP", mintedPkp);
    }
    console.log("✅ PKP successfully minted/given");

    console.log("🔄 Initializing connection to the Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Successfully connected to the Lit network");

    console.log("🔄 Creating and serializing unsigned transaction...");
    const unsignedTransaction = {
      to: "0x91fe35583603303EC3C2FF7CFBb81929A5C1bC89",
      value: 1,
      gasLimit: 21_000,
      gasPrice: (await ethersWallet.getGasPrice()).toHexString(),
      nonce: await ethersProvider.getTransactionCount(LIT_PKP_ETH_ADDRESS!),
      chainId: 175188,
    };
    console.log(unsignedTransaction);

    const unsignedTransactionHash = ethers.utils.keccak256(
      ethers.utils.serializeTransaction(unsignedTransaction)
    );
    console.log("✅ Transaction created and serialized");

    console.log("🔄 Attempting to execute the Lit Action code...")
    const result = await litNodeClient.executeJs({
      sessionSigs: await litNodeClient.getSessionSigs({
        chain: "yellowstone",
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
            walletAddress: await ethersWallet.getAddress(),
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
        publicKey: LIT_PKP_PUBLIC_KEY ?? mintedPkp!.publicKey,
        sigName: "signedTransaction",
        chain: "yellowstone",
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
