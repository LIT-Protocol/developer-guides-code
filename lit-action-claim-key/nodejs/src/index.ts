import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";
import { LIT_RPC, LIT_NETWORK, LIT_ABILITY } from "@lit-protocol/constants";
import {
  createSiweMessage,
  generateAuthSig,
  LitActionResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";

import { getEnv, getPkpInfoFromMintReceipt } from "./utils";
import { litActionCode } from "./litAction";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const LIT_CAPACITY_CREDIT_TOKEN_ID = process.env["LIT_CAPACITY_CREDIT_TOKEN_ID"];
const SELECTED_LIT_NETWORK = LIT_NETWORK.DatilTest;

export const runExample = async () => {
  let litNodeClient: LitNodeClient;
  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: SELECTED_LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    console.log("🔄 Connecting to Lit network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: SELECTED_LIT_NETWORK,
    });
    await litContracts.connect();
    console.log("✅ Connected to Lit network");

    let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (capacityTokenId === "" || capacityTokenId === undefined) {
      console.log("🔄 No Capacity Credit provided, minting a new one...");
      capacityTokenId = (
        await litContracts.mintCapacityCreditsNFT({
          requestsPerKilosecond: 10,
          daysUntilUTCMidnightExpiration: 1,
        })
      ).capacityTokenIdStr;
      console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    } else {
      console.log(
        `ℹ️  Using provided Capacity Credit with ID: ${LIT_CAPACITY_CREDIT_TOKEN_ID}`
      );
    }

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersSigner,
        capacityTokenId,
        delegateeAddresses: [ethersSigner.address],
        uses: "1",
      });
    console.log("✅ Capacity Delegation Auth Sig created");

    console.log("🔄 Getting Session Sigs via an Auth Sig...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      capabilityAuthSigs: [capacityDelegationAuthSig],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LIT_ABILITY.LitActionExecution,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }) => {
        const toSign = await createSiweMessage({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: ethersSigner.address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });
    console.log("✅ Got Session Sigs via an Auth Sig");

    console.log("🔄 Running Lit Action to derive public key using userId...");
    // Adding a Date timestamp because each userId needs to be unique
    const userId = `thisCanBeAnythingYouWant_${Date.now()}`;
    const result = await litNodeClient.executeJs({
      sessionSigs,
      code: litActionCode,
      jsParams: {
        userId,
      },
    });
    console.log(
      `✅ Derived key ID using userId: ${`0x${
        result.claims![userId].derivedKeyId
      }`}`
    );

    console.log("🔄 Getting public key for derived key id...");
    const publicKey =
      await litContracts.pubkeyRouterContract.read.getDerivedPubkey(
        litContracts.stakingContract.read.address,
        `0x${result.claims![userId].derivedKeyId}`
      );
    console.log(`✅ Derived public key: ${publicKey}`);
    console.log(
      `ℹ️  Derived ETH address: ${ethers.utils.computeAddress(publicKey)}`
    );

    console.log("🔄 Getting PKP mint cost...");
    const pkpMintCost = await litContracts.pkpNftContract.read.mintCost();
    console.log("✅ Got PKP mint cost");

    const claimTx = await litContracts.pkpNftContract.write.claimAndMint(
      2, // keyType,
      `0x${result.claims![userId].derivedKeyId}`, // derivedKeyId
      result.claims![userId].signatures, // signatures
      {
        value: pkpMintCost,
      }
    );
    const claimTxReceipt = await claimTx.wait();

    const pkpInfo = await getPkpInfoFromMintReceipt(
      claimTxReceipt,
      litContracts
    );
    console.log(`ℹ️  PKP Public Key: ${pkpInfo.publicKey}`);
    console.log(`ℹ️  PKP Token ID: ${pkpInfo.tokenId}`);
    console.log(`ℹ️  PKP ETH Address: ${pkpInfo.ethAddress}`);

    return pkpInfo;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
