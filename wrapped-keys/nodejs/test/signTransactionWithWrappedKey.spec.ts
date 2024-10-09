import { expect, use } from "chai";
import * as ethers from "ethers";
import chaiJsonSchema from "chai-json-schema";
import {
  GeneratePrivateKeyResult,
  EthereumLitTransaction,
  SerializedTransaction,
  ImportPrivateKeyResult,
} from "@lit-protocol/wrapped-keys";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { LIT_RPC } from "@lit-protocol/constants";
import bs58 from "bs58";

import { getEnv, mintPkp } from "../src/utils";
import { generateWrappedKey } from "../src/generateWrappedKey";
import { signTransactionWithWrappedKey } from "../src/signTransactionWithWrappedKey";
import { importKey } from "../src/importKey";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const SOLANA_PRIVATE_KEY = getEnv("SOLANA_PRIVATE_KEY");

describe("Signing an Ethereum transaction using generateWrappedKey and signTransactionWithEncryptedKey", () => {
  let ethersSigner: ethers.Wallet;
  let mintedPkp;
  let generateWrappedKeyResponse: GeneratePrivateKeyResult;

  before(async function () {
    this.timeout(120_000);
    ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    mintedPkp = await mintPkp(ethersSigner);

    generateWrappedKeyResponse = (await generateWrappedKey(
      mintedPkp!.publicKey,
      "evm",
      "This is a Dev Guide code example testing Ethereum key"
    )) as GeneratePrivateKeyResult;
  });

  it("should sign an Ethereum transaction", async () => {
    const litTransaction: EthereumLitTransaction = {
      chainId: 175177,
      chain: "chronicleTestnet",
      toAddress: ethersSigner.address,
      value: "0.0001",
      // Manually specifying because the generated private key doesn't hold a balance and ethers
      // fails to estimate gas since the tx simulation fails with insufficient balance error
      gasLimit: 21_000,
    };

    const signedTransaction = await signTransactionWithWrappedKey(
      mintedPkp!.publicKey,
      "evm",
      generateWrappedKeyResponse.id,
      litTransaction,
      false
    );

    expect(signedTransaction).to.match(RegExp("^0x[a-fA-F0-9]"));
  }).timeout(120_000);

  it("should sign and send an Ethereum transaction", async () => {
    const transferAmount = ethers.utils.parseEther("0.001");
    const wrappedKeyEthAddress = ethers.utils.computeAddress(
      generateWrappedKeyResponse.generatedPublicKey
    );

    console.log(
      `🔄 Using ${
        ethersSigner.address
      } to fund ${wrappedKeyEthAddress} (the Wrapped Key) with ${ethers.utils.formatEther(
        transferAmount
      )} ether for transfer test...`
    );
    const txResponse = await ethersSigner.sendTransaction({
      to: wrappedKeyEthAddress,
      value: transferAmount,
    });
    txResponse.wait();
    console.log(`✅ Funded Wrapped Key tx hash: ${txResponse.hash}`);

    console.log(
      "ethers.utils.formatEther(transferAmount.div(100))",
      ethers.utils.formatEther(transferAmount.div(100))
    );
    const litTransaction: EthereumLitTransaction = {
      chainId: 175188,
      chain: "yellowstone",
      toAddress: ethersSigner.address,
      value: ethers.utils.formatEther(transferAmount.div(100)),
      gasLimit: 21_000,
    };

    const transactionHash = await signTransactionWithWrappedKey(
      mintedPkp!.publicKey,
      "evm",
      generateWrappedKeyResponse.id,
      litTransaction,
      true
    );

    expect(transactionHash).to.match(RegExp("^0x[a-fA-F0-9]"));

    const txReceipt = await ethersSigner.provider.getTransactionReceipt(
      transactionHash as string
    );
    expect(txReceipt.status).to.eq(1);
  }).timeout(120_000);
});

describe("Signing a Solana transaction using generateWrappedKey and signTransactionWithEncryptedKey", () => {
  let mintedPkp;
  let generatedSolanaPublicKey: PublicKey;
  let generateWrappedKeyResponse: GeneratePrivateKeyResult;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    mintedPkp = await mintPkp(ethersSigner);

    generateWrappedKeyResponse = (await generateWrappedKey(
      mintedPkp!.publicKey,
      "solana",
      "This is a Dev Guide code example testing Solana key"
    )) as GeneratePrivateKeyResult;

    generatedSolanaPublicKey = new PublicKey(
      generateWrappedKeyResponse.generatedPublicKey
    );
  });

  it("should sign a Solana transaction", async () => {
    const solanaTransaction = new Transaction();
    solanaTransaction.add(
      SystemProgram.transfer({
        fromPubkey: generatedSolanaPublicKey,
        toPubkey: generatedSolanaPublicKey,
        lamports: LAMPORTS_PER_SOL / 100, // Transfer 0.01 SOL
      })
    );
    solanaTransaction.feePayer = generatedSolanaPublicKey;

    const solanaConnection = new Connection(
      clusterApiUrl("devnet"),
      "confirmed"
    );
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

    const signedTransaction = await signTransactionWithWrappedKey(
      mintedPkp!.publicKey,
      "solana",
      generateWrappedKeyResponse.id,
      litTransaction,
      false
    );

    expect(signedTransaction).to.match(RegExp("^[A-Za-z0-9+/]+={0,2}$"));
  }).timeout(120_000);

  it("should sign and send a Solana transaction within the Lit Action", async () => {
    const fundingSolanaWallet = Keypair.fromSecretKey(
      bs58.decode(SOLANA_PRIVATE_KEY)
    );
    const transferAmount = LAMPORTS_PER_SOL / 100; // 0.01 SOL
    const solanaConnection = new Connection(
      clusterApiUrl("devnet"),
      "confirmed"
    );
    const wrappedKeyPublicKey = new PublicKey(
      generateWrappedKeyResponse.generatedPublicKey
    );

    console.log(
      `🔄 Using ${fundingSolanaWallet.publicKey.toBase58()} to send ${
        transferAmount / LAMPORTS_PER_SOL
      } SOL to ${wrappedKeyPublicKey.toBase58()} for transfer test...`
    );
    const solanaTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fundingSolanaWallet.publicKey,
        toPubkey: wrappedKeyPublicKey,
        lamports: transferAmount,
      })
    );
    const fundingSignature = await sendAndConfirmTransaction(
      solanaConnection,
      solanaTransaction,
      [fundingSolanaWallet]
    );
    console.log(`✅ Funded Wrapped Key tx signature: ${fundingSignature}`);

    const testTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wrappedKeyPublicKey,
        toPubkey: fundingSolanaWallet.publicKey,
        lamports: transferAmount / 2, // Return half the amount
      })
    );
    testTransaction.feePayer = wrappedKeyPublicKey;
    const { blockhash, lastValidBlockHeight } =
      await solanaConnection.getLatestBlockhash();
    testTransaction.recentBlockhash = blockhash;

    const serializedTransaction = testTransaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");
    const litTransaction: SerializedTransaction = {
      serializedTransaction,
      chain: "devnet",
    };
    const signedTransaction = await signTransactionWithWrappedKey(
      mintedPkp!.publicKey,
      "solana",
      generateWrappedKeyResponse.id,
      litTransaction,
      true
    );

    expect(signedTransaction).to.match(RegExp("^[A-Za-z0-9+/]+={0,2}$"));

    // Wait for confirmation
    const confirmation = await solanaConnection.confirmTransaction({
      signature: signedTransaction as string,
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
    });
    expect(confirmation.value.err).to.be.null;
  }).timeout(120_000);

  it("should sign and send a Solana transaction manually", async () => {
    const fundingSolanaWallet = Keypair.fromSecretKey(
      bs58.decode(SOLANA_PRIVATE_KEY)
    );
    const transferAmount = LAMPORTS_PER_SOL / 100; // 0.01 SOL
    const solanaConnection = new Connection(
      clusterApiUrl("devnet"),
      "confirmed"
    );
    const wrappedKeyPublicKey = new PublicKey(
      generateWrappedKeyResponse.generatedPublicKey
    );

    console.log(
      `🔄 Using ${fundingSolanaWallet.publicKey.toBase58()} to send ${
        transferAmount / LAMPORTS_PER_SOL
      } SOL to ${wrappedKeyPublicKey.toBase58()} for transfer test...`
    );
    const solanaTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fundingSolanaWallet.publicKey,
        toPubkey: wrappedKeyPublicKey,
        lamports: transferAmount,
      })
    );
    const fundingSignature = await sendAndConfirmTransaction(
      solanaConnection,
      solanaTransaction,
      [fundingSolanaWallet]
    );
    console.log(`✅ Funded Wrapped Key tx signature: ${fundingSignature}`);

    const testTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wrappedKeyPublicKey,
        toPubkey: fundingSolanaWallet.publicKey,
        lamports: transferAmount / 2, // Return half the amount
      })
    );
    testTransaction.feePayer = wrappedKeyPublicKey;
    const { blockhash, lastValidBlockHeight } =
      await solanaConnection.getLatestBlockhash();
    testTransaction.recentBlockhash = blockhash;

    const serializedTransaction = testTransaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");
    const litTransaction: SerializedTransaction = {
      serializedTransaction,
      chain: "devnet",
    };
    const signedTransaction = await signTransactionWithWrappedKey(
      mintedPkp!.publicKey,
      "solana",
      generateWrappedKeyResponse.id,
      litTransaction,
      false
    );

    expect(signedTransaction).to.match(RegExp("^[A-Za-z0-9+/]+={0,2}$"));

    testTransaction.addSignature(
      wrappedKeyPublicKey,
      Buffer.from(signedTransaction as string, "base64")
    );
    const serializedSignedTransaction = testTransaction.serialize();
    const txSig = await solanaConnection.sendRawTransaction(
      serializedSignedTransaction
    );
    console.log("Transaction signature:", txSig);

    // Wait for confirmation
    const confirmation = await solanaConnection.confirmTransaction({
      signature: txSig,
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
    });
    expect(confirmation.value.err).to.be.null;
  }).timeout(120_000);
});

describe("Signing a Solana transaction using importPrivateKey and signTransactionWithEncryptedKey", () => {
  let solanaKeypair: Keypair;
  let mintedPkp;
  let importKeyResponse: ImportPrivateKeyResult;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    solanaKeypair = Keypair.generate();

    mintedPkp = await mintPkp(ethersSigner);

    importKeyResponse = (await importKey(
      mintedPkp!.publicKey,
      Buffer.from(solanaKeypair.secretKey).toString("hex"),
      solanaKeypair.publicKey.toString(),
      "ed25519",
      "This is a Dev Guide code example testing Solana key"
    )) as ImportPrivateKeyResult;
  });

  it("should sign a Solana transaction", async () => {
    const solanaTransaction = new Transaction();
    solanaTransaction.add(
      SystemProgram.transfer({
        fromPubkey: solanaKeypair.publicKey,
        toPubkey: solanaKeypair.publicKey,
        lamports: LAMPORTS_PER_SOL / 100, // Transfer 0.01 SOL
      })
    );
    solanaTransaction.feePayer = solanaKeypair.publicKey;

    const solanaConnection = new Connection(
      clusterApiUrl("devnet"),
      "confirmed"
    );
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

    const signedTransaction = await signTransactionWithWrappedKey(
      mintedPkp!.publicKey,
      "solana",
      importKeyResponse.id,
      litTransaction,
      false
    );

    expect(signedTransaction).to.match(RegExp("^[A-Za-z0-9+/]+={0,2}$"));
  }).timeout(120_000);

  it("should sign and send a Solana transaction within the Lit Action", async () => {
    const fundingSolanaWallet = Keypair.fromSecretKey(
      bs58.decode(SOLANA_PRIVATE_KEY)
    );
    const transferAmount = LAMPORTS_PER_SOL / 100; // 0.01 SOL
    const solanaConnection = new Connection(
      clusterApiUrl("devnet"),
      "confirmed"
    );

    console.log(
      `🔄 Using ${fundingSolanaWallet.publicKey.toBase58()} to send ${
        transferAmount / LAMPORTS_PER_SOL
      } SOL to ${solanaKeypair.publicKey.toString()} for transfer test...`
    );
    const solanaTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fundingSolanaWallet.publicKey,
        toPubkey: solanaKeypair.publicKey,
        lamports: transferAmount,
      })
    );
    const fundingSignature = await sendAndConfirmTransaction(
      solanaConnection,
      solanaTransaction,
      [fundingSolanaWallet]
    );
    console.log(`✅ Funded Wrapped Key tx signature: ${fundingSignature}`);

    const testTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solanaKeypair.publicKey,
        toPubkey: fundingSolanaWallet.publicKey,
        lamports: transferAmount / 2, // Return half the amount
      })
    );
    testTransaction.feePayer = solanaKeypair.publicKey;
    const { blockhash, lastValidBlockHeight } =
      await solanaConnection.getLatestBlockhash();
    testTransaction.recentBlockhash = blockhash;

    const serializedTransaction = testTransaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");
    const litTransaction: SerializedTransaction = {
      serializedTransaction,
      chain: "devnet",
    };
    const signedTransaction = await signTransactionWithWrappedKey(
      mintedPkp!.publicKey,
      "solana",
      importKeyResponse.id,
      litTransaction,
      true
    );

    expect(signedTransaction).to.match(RegExp("^[A-Za-z0-9+/]+={0,2}$"));

    // Wait for confirmation
    const confirmation = await solanaConnection.confirmTransaction({
      signature: signedTransaction as string,
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
    });
    expect(confirmation.value.err).to.be.null;
  }).timeout(120_000);

  it("should sign and send a Solana transaction manually", async () => {
    const fundingSolanaWallet = Keypair.fromSecretKey(
      bs58.decode(SOLANA_PRIVATE_KEY)
    );
    const transferAmount = LAMPORTS_PER_SOL / 100; // 0.01 SOL
    const solanaConnection = new Connection(
      clusterApiUrl("devnet"),
      "confirmed"
    );

    console.log(
      `🔄 Using ${fundingSolanaWallet.publicKey.toBase58()} to send ${
        transferAmount / LAMPORTS_PER_SOL
      } SOL to ${solanaKeypair.publicKey.toString()} for transfer test...`
    );
    const solanaTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fundingSolanaWallet.publicKey,
        toPubkey: solanaKeypair.publicKey,
        lamports: transferAmount,
      })
    );
    const fundingSignature = await sendAndConfirmTransaction(
      solanaConnection,
      solanaTransaction,
      [fundingSolanaWallet]
    );
    console.log(`✅ Funded Wrapped Key tx signature: ${fundingSignature}`);

    const testTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solanaKeypair.publicKey,
        toPubkey: fundingSolanaWallet.publicKey,
        lamports: transferAmount / 2, // Return half the amount
      })
    );
    testTransaction.feePayer = solanaKeypair.publicKey;
    const { blockhash, lastValidBlockHeight } =
      await solanaConnection.getLatestBlockhash();
    testTransaction.recentBlockhash = blockhash;

    const serializedTransaction = testTransaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");
    const litTransaction: SerializedTransaction = {
      serializedTransaction,
      chain: "devnet",
    };
    const signedTransaction = await signTransactionWithWrappedKey(
      mintedPkp!.publicKey,
      "solana",
      importKeyResponse.id,
      litTransaction,
      false
    );

    expect(signedTransaction).to.match(RegExp("^[A-Za-z0-9+/]+={0,2}$"));

    testTransaction.addSignature(
      solanaKeypair.publicKey,
      Buffer.from(signedTransaction as string, "base64")
    );
    const serializedSignedTransaction = testTransaction.serialize();
    const txSig = await solanaConnection.sendRawTransaction(
      serializedSignedTransaction
    );

    // Wait for confirmation
    const confirmation = await solanaConnection.confirmTransaction({
      signature: txSig,
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
    });
    expect(confirmation.value.err).to.be.null;
  }).timeout(120_000);
});
