import ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const runExample = async (solanaKeypair: Keypair) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Creating and signing Solana transaction...");
    const solanaTransaction = new Transaction();
    solanaTransaction.add(
      SystemProgram.transfer({
        fromPubkey: solanaKeypair.publicKey,
        toPubkey: new PublicKey(solanaKeypair.publicKey),
        lamports: LAMPORTS_PER_SOL / 100, // Transfer 0.01 SOL
      })
    );

    const solanaConnection = new Connection(
      clusterApiUrl("devnet"),
      "confirmed"
    );
    const { blockhash } = await solanaConnection.getLatestBlockhash();
    solanaTransaction.recentBlockhash = blockhash;

    solanaTransaction.sign(solanaKeypair);
    console.log("✅ Created and signed transaction");

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: true,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Getting Session Signatures...");
    const sessionSigs = await litNodeClient.getSessionSigs({
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
    console.log("✅ Got Session Signatures");

    console.log("🔄 Executing Lit Action...");
    const litActionSignatures = await litNodeClient.executeJs({
      sessionSigs,
      ipfsId: "QmPBVa31Kgiy7H5T19JQf3Pb5juVcCfb8jJBviHty6Tk8q",
      jsParams: {
        signedTx: bs58.encode(solanaTransaction.serialize()),
      },
    });
    console.log("✅ Executed Lit Action");

    return litActionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
