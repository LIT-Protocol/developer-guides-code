import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  AuthMethodScope,
  LitNetwork,
  ProviderType,
} from "@lit-protocol/constants";
import {
  EthWalletProvider,
  LitAuthClient,
} from "@lit-protocol/lit-auth-client";
import { api, SerializedTransaction } from "@lit-protocol/wrapped-keys";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import bs58 from "bs58";

const { importPrivateKey, signTransactionWithEncryptedKey } = api;

import { getEnv } from "./utils";

const LIT_RELAYER_API_KEY = getEnv("LIT_RELAYER_API_KEY");
const FUNDING_SOLANA_WALLET_PRIVATE_KEY = getEnv(
  "FUNDING_SOLANA_WALLET_PRIVATE_KEY"
);

export const runTheExample = async () => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Generating an Ethereum wallet for the user...");
    let userEthersSigner = ethers.Wallet.createRandom();
    userEthersSigner = userEthersSigner.connect(
      new ethers.providers.JsonRpcProvider(
        "https://rpc-vesuvius-as793xpg5g.t.conduit.xyz"
      )
    );
    console.log(`✅ Created the Ethereum wallet: ${userEthersSigner.address}`);

    console.log("🔄 Generating a Solana wallet for the user...");
    let userSolanaKeypair = Keypair.generate();
    console.log(
      `✅ Created the Solana wallet: ${userSolanaKeypair.publicKey.toBase58()}`
    );

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Initializing a Lit Auth client...");
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: LIT_RELAYER_API_KEY,
      },
      rpcUrl: "https://rpc-vesuvius-as793xpg5g.t.conduit.xyz",
      litNodeClient,
    });
    console.log("✅ Initialized a Lit Auth client");

    console.log("🔄 Initializing Lit Auth EthWallet provider...");
    const userAuthProvider = litAuthClient.initProvider(ProviderType.EthWallet);
    console.log("✅ Initialized Lit Auth EthWallet provider");

    console.log("🔄 Authenticating Lit Auth EthWallet provider...");
    const userAuthMethod = await EthWalletProvider.authenticate({
      signer: userEthersSigner,
      litNodeClient,
    });
    console.log("✅ Authenticated Lit Auth EthWallet provider");

    console.log("🔄 Minting PKP via Relayer...");
    const mintedPkpTransactionHash =
      await userAuthProvider.mintPKPThroughRelayer(userAuthMethod, {
        permittedAuthMethodScopes: [[AuthMethodScope.SignAnything]],
      });
    console.log(
      `✅ Minted PKP via Relayer. Transaction hash: ${mintedPkpTransactionHash}`
    );

    console.log("🔄 Fetching PKPs for user wallet...");
    const pkps = await userAuthProvider.fetchPKPsThroughRelayer(userAuthMethod);
    console.log(`✅ Fetched ${pkps.length} PKP(s) for user wallet`);

    console.log("🔄 Generating PKP Session Signatures with the user's PKP...");
    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: pkps[0].publicKey,
      authMethods: [
        await EthWalletProvider.authenticate({
          signer: userEthersSigner,
          litNodeClient,
          expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        }),
      ],
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log("✅ Generated PKP Session Signatures");

    console.log(
      "🔄 Importing user's Solana private key as a Lit Wrapped Key..."
    );
    const pkpAddress = await importPrivateKey({
      pkpSessionSigs,
      litNodeClient,
      privateKey: Buffer.from(userSolanaKeypair.secretKey).toString("hex"),
      publicKey: pkps[0].publicKey,
      keyType: "ed25519",
    });
    console.log(
      `✅ Imported Solana private key, and attached to PKP with address: ${pkpAddress}`
    );

    console.log("🔄 Funding user's Solana address on devnet...");
    const solanaFundingWallet = Keypair.fromSecretKey(
      bs58.decode(FUNDING_SOLANA_WALLET_PRIVATE_KEY)
    );
    const solanaConnection = new Connection(
      clusterApiUrl("devnet"),
      "confirmed"
    );
    const fundingAmount = LAMPORTS_PER_SOL / 100; // Transfer 0.01 SOL
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solanaFundingWallet.publicKey,
        toPubkey: userSolanaKeypair.publicKey,
        lamports: fundingAmount,
      })
    );
    const signature = await sendAndConfirmTransaction(
      solanaConnection,
      transaction,
      [solanaFundingWallet]
    );
    console.log(
      `✅ Funded ${userSolanaKeypair.publicKey.toBase58()} with ${
        fundingAmount / LAMPORTS_PER_SOL
      } SOL. Transaction hash: ${signature}`
    );

    console.log(
      `🔄 Check Lit token balance for ${userSolanaKeypair.publicKey.toBase58()}...`
    );
    const balance = await solanaConnection.getBalance(
      userSolanaKeypair.publicKey
    );
    console.log(`✅ Got balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    console.log("🔄 Signing and sending a transaction with Wrapped Key...");
    const transferAmount = LAMPORTS_PER_SOL / 1000; // Transfer 0.001 SOL;
    const solanaTransaction = new Transaction();
    solanaTransaction.add(
      SystemProgram.transfer({
        fromPubkey: userSolanaKeypair.publicKey,
        toPubkey: solanaFundingWallet.publicKey,
        lamports: transferAmount,
      })
    );
    solanaTransaction.feePayer = userSolanaKeypair.publicKey;

    const { blockhash } = await solanaConnection.getLatestBlockhash();
    solanaTransaction.recentBlockhash = blockhash;

    const serializedTransaction = solanaTransaction
      .serialize({
        requireAllSignatures: false, // should be false as we're not signing the message
        verifySignatures: false, // should be false as we're not signing the message
      })
      .toString("base64");

    const litTransaction: SerializedTransaction = {
      serializedTransaction,
      chain: "devnet",
    };

    const transactionSignature = await signTransactionWithEncryptedKey({
      pkpSessionSigs,
      network: "solana",
      unsignedTransaction: litTransaction,
      broadcast: true,
      litNodeClient,
    });
    console.log(
      `✅ Signed and sent transaction. Transaction hash: ${bs58.encode(
        Buffer.from(transactionSignature, "base64")
      )}`
    );
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};

await runTheExample();
