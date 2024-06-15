import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";

import { litActionCode } from "./litAction";
import { LitNetwork } from "@lit-protocol/constants";
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
const ETHERS_WALLET = new ethers.Wallet(
  ETHEREUM_PRIVATE_KEY,
  new ethers.providers.JsonRpcProvider("https://chain-rpc.litprotocol.com/http")
);
const SEPOLIA_RPC_URL = getEnv("SEPOLIA_RPC_URL");
const LIT_PKP_PUBLIC_KEY = process.env.LIT_PKP_PUBLIC_KEY;
const LIT_PKP_ETH_ADDRESS = process.env.LIT_PKP_ETH_ADDRESS;

export const signAndCombineAndSendTx = async () => {
  let litNodeClient: LitNodeClient;

  try {
    let mintedPkp;
    if (LIT_PKP_PUBLIC_KEY === undefined || LIT_PKP_PUBLIC_KEY == "") {
      const litContracts = new LitContracts({
        signer: ETHERS_WALLET,
        network: LitNetwork.Cayenne,
      });

      await litContracts.connect();
      mintedPkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
      console.log("Minted a new PKP", mintedPkp);
    }

    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Cayenne,
    });
    await litNodeClient.connect();

    const ethersProvider = new ethers.providers.JsonRpcProvider(
      SEPOLIA_RPC_URL
    );
    const unsignedTx = {
      to: "0x91fe35583603303EC3C2FF7CFBb81929A5C1bC89",
      value: 1,
      gasLimit: 21_000,
      gasPrice: (await ethersProvider.getGasPrice()).toHexString(),
      nonce: await ethersProvider.getTransactionCount(
        LIT_PKP_ETH_ADDRESS ?? mintedPkp!.ethAddress
      ),
      chainId: 11155111,
    };

    const unsignedTxHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(ethers.utils.serializeTransaction(unsignedTx))
    );

    const result = await litNodeClient.executeJs({
      sessionSigs: await litNodeClient.getSessionSigs({
        chain: "ethereum",
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
            walletAddress: await ETHERS_WALLET.getAddress(),
            nonce: await litNodeClient.getLatestBlockhash(),
            litNodeClient,
          });

          return await generateAuthSig({
            signer: ETHERS_WALLET,
            toSign,
          });
        },
      }),
      code: litActionCode,
      jsParams: {
        toSign: ethers.utils.arrayify(unsignedTxHash),
        publicKey: LIT_PKP_PUBLIC_KEY ?? mintedPkp!.publicKey,
        sigName: "signedTransaction",
        chain: "sepolia",
        unsignedTx,
      },
    });
    console.log("result", result);
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
