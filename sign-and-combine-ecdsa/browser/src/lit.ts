import { disconnectWeb3, LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { ethers } from "ethers";

import {
  connectLitNodeClient,
  createCapacityDelegationAuthSig,
  getChainInfo,
  getEthersSigner,
  getHashSerializedUnsignedTransaction,
  fundPkp,
  mintCapacityCredit,
} from "./utils";
import { litActionCode } from "./litAction";

const LIT_PKP_ETH_ADDRESS = import.meta.env.VITE_LIT_PKP_ETH_ADDRESS;
const LIT_PKP_PUBLIC_KEY = import.meta.env.VITE_LIT_PKP_PUBLIC_KEY;
const LIT_CAPACITY_CREDIT_TOKEN_ID = import.meta.env
  .VITE_LIT_CAPACITY_CREDIT_TOKEN_ID;
const CHAIN_TO_SEND_TX_ON = import.meta.env.VITE_CHAIN_TO_SEND_TX_ON;
const LIT_NETWORK = LitNetwork.DatilTest;

export const signAndCombineEcdsa = async (
  chainToSendTxOn: string = CHAIN_TO_SEND_TX_ON
  // partialUnsignedTransaction: {
  //   to: string;
  //   value: string;
  //   data: string;
  // }
) => {
  let litNodeClient: LitNodeClient;

  try {
    const chainInfoToSendTxOn = getChainInfo(chainToSendTxOn);
    const ethersSigner = await getEthersSigner();
    // TODO: blocked by https://linear.app/litprotocol/issue/DREL-294/cant-connect-litcontracts-client-using-sdk-v670
    // const pkpInfo = await mintPkp(ethersSigner, LIT_NETWORK);

    await fundPkp(ethersSigner, chainInfoToSendTxOn, {
      ethAddress: LIT_PKP_ETH_ADDRESS,
    });

    const partialUnsignedTransaction = {
      to: await ethersSigner.getAddress(),
      value: 1,
      gasLimit: 21_000,
      gasPrice: (await ethersSigner.getGasPrice()).toHexString(),
      nonce: await ethersSigner.provider.getTransactionCount(
        LIT_PKP_ETH_ADDRESS
      ),
      chainId: chainInfoToSendTxOn.chainId,
    };

    const hashedUnsignedTransaction =
      await getHashSerializedUnsignedTransaction(
        ethersSigner,
        chainInfoToSendTxOn,
        LIT_PKP_ETH_ADDRESS
      );

    // TODO: blocked by https://linear.app/litprotocol/issue/DREL-294/cant-connect-litcontracts-client-using-sdk-v670
    // const capacityTokenId = await mintCapacityCredit(ethersSigner, LIT_NETWORK);

    litNodeClient = await connectLitNodeClient(LIT_NETWORK);

    // const capacityDelegationAuthSig = await createCapacityDelegationAuthSig(
    //   litNodeClient,
    //   ethersSigner,
    //   LIT_CAPACITY_CREDIT_TOKEN_ID
    // );

    console.log("🔄 Attempting to execute the Lit Action code...");
    const result = await litNodeClient.executeJs({
      sessionSigs: await litNodeClient.getSessionSigs({
        chain: chainToSendTxOn,
        // capabilityAuthSigs: [capacityDelegationAuthSig],
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
            walletAddress: await ethersSigner.getAddress(),
            nonce: await litNodeClient.getLatestBlockhash(),
            litNodeClient,
          });

          return await generateAuthSig({
            signer: ethersSigner,
            toSign,
          });
        },
      }),
      code: litActionCode,
      jsParams: {
        toSign: ethers.utils.arrayify(hashedUnsignedTransaction),
        publicKey: LIT_PKP_PUBLIC_KEY,
        sigName: "signedTransaction",
        chain: chainToSendTxOn,
        unsignedTransaction: partialUnsignedTransaction,
      },
    });
    console.log("✅ Lit Action code executed successfully");
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error in signAndCombineEcdsa:", error);
    throw error;
  } finally {
    litNodeClient!.disconnect();
    disconnectWeb3();
  }
};
