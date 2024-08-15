import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { AuthMethodType, LitNetwork } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from "ethers";
import { LitAbility, LitPKPResource } from "@lit-protocol/auth-helpers";
import { enc, HmacSHA256, SHA256 } from "crypto-js";

import { TelegramUser } from "./mintPkp";

export interface MintedPkp {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
}

const VITE_TELEGRAM_BOT_SECRET = import.meta.env.VITE_TELEGRAM_BOT_SECRET;
const VITE_LIT_ACTION_IPFS_CID = import.meta.env.VITE_LIT_ACTION_IPFS_CID;

export const getPkpSessionSigs = async (
  telegramUser: TelegramUser,
  mintedPkp: MintedPkp
) => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting to Ethereum account...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const ethersSigner = provider.getSigner();
    console.log(
      "✅ Connected Ethereum account:",
      await ethersSigner.getAddress()
    );

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilTest,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.DatilTest,
      debug: false,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    console.log("🔄 Minting Capacity Credits NFT...");
    const capacityTokenId = (
      await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 1,
      })
    ).capacityTokenIdStr;
    console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersSigner,
        capacityTokenId,
        delegateeAddresses: [mintedPkp.ethAddress],
        uses: "1",
      });
    console.log(`✅ Created the capacityDelegationAuthSig`);

    console.log("🔄 Getting the Session Sigs for the PKP...");
    const sessionSignatures = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: mintedPkp.publicKey,
      capabilityAuthSigs: [capacityDelegationAuthSig],
      litActionIpfsId: VITE_LIT_ACTION_IPFS_CID,
      jsParams: {
        telegramUserData: JSON.stringify(telegramUser),
        // telegramBotTokenHash: SHA256(VITE_TELEGRAM_BOT_SECRET),
        // TODO Replace with hash
        telegramBotTokenHash: VITE_TELEGRAM_BOT_SECRET,
        pkpTokenId: mintedPkp.tokenId,
      },
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log(
      `✅ Got PKP Session Sigs: ${JSON.stringify(sessionSignatures, null, 2)}`
    );
    return sessionSignatures;
  } catch (error) {
    console.error(error);
  }
};
