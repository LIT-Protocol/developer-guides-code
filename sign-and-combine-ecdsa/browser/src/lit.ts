import { LitNodeClient } from "@lit-protocol/lit-node-client";
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
  mintCapacityCredit,
  mintPkp,
} from "./utils";
import { litActionCode } from "./litAction";
import { LitContracts } from "@lit-protocol/contracts-sdk";

export const signAndCombineEcdsa = async (
  chainToSendTxOn: string
  // partialUnsignedTransaction: {
  //   to: string;
  //   value: string;
  //   data: string;
  // }
) => {
  const LIT_NETWORK = LitNetwork.DatilTest;
  let partialUnsignedTransaction;

  let litNodeClient: LitNodeClient;

  try {
    // const chainInfoToSendTxOn = getChainInfo(chainToSendTxOn);
    const ethersSigner = await getEthersSigner();
    // const pkpInfo = await mintPkp(ethersSigner, LIT_NETWORK);

    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.DatilTest,
    });
    await litContracts.connect();

    // partialUnsignedTransaction = {
    //   to: await ethersSigner.getAddress(),
    //   value: 1,
    //   gasLimit: 21_000,
    //   gasPrice: (await ethersSigner.getGasPrice()).toHexString(),
    //   nonce: await ethersSigner.provider.getTransactionCount(
    //     pkpInfo!.ethAddress
    //   ),
    //   chainId: chainInfoToSendTxOn.chainId,
    // };

    // const hashedUnsignedTransaction =
    //   await getHashSerializedUnsignedTransaction(
    //     ethersSigner,
    //     chainInfoToSendTxOn,
    //     pkpInfo!
    //   );
    // const capacityTokenId = await mintCapacityCredit(ethersSigner, LIT_NETWORK);

    // litNodeClient = await connectLitNodeClient(LIT_NETWORK);

    // const capacityDelegationAuthSig = await createCapacityDelegationAuthSig(
    //   litNodeClient,
    //   ethersSigner,
    //   capacityTokenId!
    // );

    // console.log("🔄 Attempting to execute the Lit Action code...");
    // const result = await litNodeClient.executeJs({
    //   sessionSigs: await litNodeClient.getSessionSigs({
    //     chain: chainToSendTxOn,
    //     capabilityAuthSigs: [capacityDelegationAuthSig],
    //     expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    //     resourceAbilityRequests: [
    //       {
    //         resource: new LitPKPResource("*"),
    //         ability: LitAbility.PKPSigning,
    //       },
    //       {
    //         resource: new LitActionResource("*"),
    //         ability: LitAbility.LitActionExecution,
    //       },
    //     ],
    //     authNeededCallback: async ({
    //       resourceAbilityRequests,
    //       expiration,
    //       uri,
    //     }) => {
    //       const toSign = await createSiweMessageWithRecaps({
    //         uri: uri!,
    //         expiration: expiration!,
    //         resources: resourceAbilityRequests!,
    //         walletAddress: await ethersSigner.getAddress(),
    //         nonce: await litNodeClient.getLatestBlockhash(),
    //         litNodeClient,
    //       });

    //       return await generateAuthSig({
    //         signer: ethersSigner,
    //         toSign,
    //       });
    //     },
    //   }),
    //   code: litActionCode,
    //   jsParams: {
    //     toSign: ethers.utils.arrayify(hashedUnsignedTransaction),
    //     publicKey: pkpInfo!.publicKey!,
    //     sigName: "signedTransaction",
    //     chain: chainToSendTxOn,
    //     unsignedTransaction: partialUnsignedTransaction,
    //   },
    // });
    // console.log("✅ Lit Action code executed successfully");
    // console.log(result);
    // return result;
  } catch (error) {
    console.error("Error in signAndCombineEcdsa:", error);
    throw error;
  } finally {
    litNodeClient!.disconnect();
  }
};
