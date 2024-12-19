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
import { LitClient } from '@lit-protocol/lit-agent-signer';
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";

import { getChainInfo, getEnv } from "./utils";
import { litActionCode } from "./litAction";
import * as fs from 'fs';
import * as path from 'path';

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const SELECTED_LIT_NETWORK = LIT_NETWORK.DatilDev;
const PKP_INFO_PATH = path.join(__dirname, '../pkp-info.json');

const loadExistingPKP = (): any | null => {
  try {
    if (fs.existsSync(PKP_INFO_PATH)) {
      const pkpData = fs.readFileSync(PKP_INFO_PATH, 'utf8');
      return JSON.parse(pkpData);
    }
  } catch (error) {
    console.error("Error loading PKP info:", error);
  }
  return null;
};

export const swapAITest = async () => {
  let litNodeClient: LitNodeClient;
  let pkp: any;

  const ethersWallet = new ethers.Wallet(ETHEREUM_PRIVATE_KEY);

  console.log("🔄 Connecting to the Lit network...");
  litNodeClient = new LitNodeClient({
    litNetwork: SELECTED_LIT_NETWORK,
    debug: false,
  });
  await litNodeClient.connect();
  console.log("✅ Connected to the Lit network");

  console.log("🔄 Connecting LitContracts client to network...");
  const litContracts = new LitContracts({
    signer: new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY, 
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    ),
    network: SELECTED_LIT_NETWORK,
  });
  await litContracts.connect();
  console.log("✅ Connected LitContracts client to network");

  try {
    console.log("🔄 Checking for existing PKP...");
    const existingPKP = loadExistingPKP();
    if (existingPKP) {
      console.log("✅ Found existing PKP");
      pkp = existingPKP;
    } else {
      console.log("🔄 No existing PKP found, minting new one...");

      const mintPKPResult = await litContracts.pkpNftContractUtils.write.mint();
      pkp = mintPKPResult.pkp;
      console.log("✅ PKP minted:", {
        tokenId: pkp.tokenId,
        publicKey: pkp.publicKey,
        ethAddress: pkp.ethAddress
      });

      fs.writeFileSync(PKP_INFO_PATH, JSON.stringify(pkp, null, 2));
      console.log("✅ PKP info saved to file");
    }

    const authMethod = await EthWalletProvider.authenticate({
      signer: ethersWallet,
      litNodeClient,
    });
    console.log("✅ Finished creating the AuthMethod");

    const sessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: pkp.publicKey!,
      authMethods: [authMethod],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LIT_ABILITY.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LIT_ABILITY.LitActionExecution,
        }
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log("✅ Got Session Signatures");

    const baseParams = {
      tokenIn: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      tokenOut: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
      amountIn: ".2"
    }

    const arbParams = {
      tokenIn: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      tokenOut: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      amountIn: ".3"
    }

    const opParams = {
      tokenIn: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      tokenOut: "0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1",
      amountIn: ".1"
    }

    const baseChainInfo = {
      rpcUrl: process.env.BASE_RPC_URL,
      chainId: 8453
    }

    const arbChainInfo = {
      rpcUrl: process.env.ARB_RPC_URL,
      chainId: 42161
    }

    const opChainInfo = {
      rpcUrl: process.env.OP_RPC_URL,
      chainId: 10
    }

/*  const baseResponse = await litNodeClient.executeJs({
      code: litActionCode,
      sessionSigs,
      jsParams: {
        pkp,
        params: baseParams,
        chainInfo: baseChainInfo
      }
    });  

    const arbResponse = await litNodeClient.executeJs({
      code: litActionCode,
      sessionSigs,
      jsParams: {
        pkp,
        params: arbParams,
        chainInfo: arbChainInfo
      }
    })
 
    const opResponse = await litNodeClient.executeJs({
      code: litActionCode,
      sessionSigs,
      jsParams: {
        pkp,
        params: opParams,
        chainInfo: opChainInfo
      }
    })

    console.log(baseResponse);
    console.log(arbResponse); 
    console.log(opResponse);*/
    return sessionSigs;

  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
