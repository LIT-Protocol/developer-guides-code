import { expect, use } from "chai";
import * as ethers from "ethers";
import chaiJsonSchema from "chai-json-schema";
import {
  GeneratePrivateKeyResult,
  EthereumLitTransaction,
  SerializedTransaction,
} from "@lit-protocol/wrapped-keys";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";

import { getEnv, mintPkp } from "../src/utils";
import { generateWrappedKey } from "../src/generateWrappedKey";
import { signTransactionWithWrappedKey } from "../src/signTransactionWithWrappedKey";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Signing an Ethereum transaction using generateWrappedKey and signTransactionWithEncryptedKey", () => {
  let ethersSigner: ethers.Wallet;
  let mintedPkp;
  let generateWrappedKeyResponse;

  before(async function () {
    this.timeout(120_000);
    ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    mintedPkp = await mintPkp(ethersSigner);

    generateWrappedKeyResponse = (await generateWrappedKey(
      mintedPkp!.publicKey,
      "evm"
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
      litTransaction,
      false
    );

    expect(signedTransaction).to.match(RegExp("^0x[a-fA-F0-9]"));
  }).timeout(120_000);
});

describe("Signing a Solana transaction using generateWrappedKey and signTransactionWithEncryptedKey", () => {
  let mintedPkp;
  let generatedSolanaPublicKey: PublicKey;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    mintedPkp = await mintPkp(ethersSigner);

    const generateWrappedKeyResponse = (await generateWrappedKey(
      mintedPkp!.publicKey,
      "solana"
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
      clusterApiUrl("testnet"),
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
      chain: "testnet",
    };

    const signedTransaction = await signTransactionWithWrappedKey(
      mintedPkp!.publicKey,
      "solana",
      litTransaction,
      false
    );

    expect(signedTransaction).to.match(RegExp("^[A-Za-z0-9+/]+={0,2}$"));
  }).timeout(120_000);
});
