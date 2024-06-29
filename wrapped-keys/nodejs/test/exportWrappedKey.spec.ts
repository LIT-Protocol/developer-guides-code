import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import * as ethers from "ethers";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

import { getEnv, mintPkp } from "../src/utils";
import { exportWrappedKey } from "../src/exportWrappedKey";
import { importKey } from "../src/importKey";
import { generateWrappedKey } from "../src/generateWrappedKey";
import { GeneratePrivateKeyResult } from "@lit-protocol/wrapped-keys";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const NEW_ETHEREUM_PRIVATE_KEY = ethers.Wallet.createRandom().privateKey;
const NEW_SOLANA_PRIVATE_KEY = Keypair.generate().secretKey;

xdescribe("Exporting a wrapped Ethereum key using exportPrivateKey", () => {
  let mintedPkp;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    mintedPkp = await mintPkp(ethersSigner);

    const pkpAddressKeyWasAttachedTo = await importKey(
      mintedPkp!.publicKey,
      NEW_ETHEREUM_PRIVATE_KEY,
      ethersSigner.publicKey,
      "K256"
    );

    expect(pkpAddressKeyWasAttachedTo).to.equal(mintedPkp!.ethAddress);
  });

  it("should export a wrapped Ethereum private key", async () => {
    const exportedPrivateKeyResult = await exportWrappedKey(
      mintedPkp!.publicKey
    );
    expect(exportedPrivateKeyResult!.decryptedPrivateKey).to.equal(
      NEW_ETHEREUM_PRIVATE_KEY
    );
  }).timeout(120_000);
});

describe("Exporting a wrapped Solana key using exportPrivateKey", () => {
  let mintedPkp;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    mintedPkp = await mintPkp(ethersSigner);

    const pkpAddressKeyWasAttachedTo = await importKey(
      mintedPkp!.publicKey,
      bs58.encode(NEW_SOLANA_PRIVATE_KEY),
      Keypair.fromSecretKey(NEW_SOLANA_PRIVATE_KEY).publicKey.toString(),
      "ed25519"
    );

    expect(pkpAddressKeyWasAttachedTo).to.equal(mintedPkp!.ethAddress);
  });

  it("should export a wrapped Solana private key", async () => {
    const exportedPrivateKeyResult = await exportWrappedKey(
      mintedPkp!.publicKey
    );
    expect(exportedPrivateKeyResult!.decryptedPrivateKey).to.equal(
      bs58.encode(NEW_SOLANA_PRIVATE_KEY)
    );
  }).timeout(120_000);
});

// TODO Test fails with a known issue: https://linear.app/litprotocol/issue/LIT-3482/[slack][genius]-error-decrypting-wrapped-solana-key
describe.skip("Exporting a generated wrapped Solana key using generatePrivateKey and exportPrivateKey", () => {
  let mintedPkp;
  let generateWrappedKeyResponse;
  let expectedSolanaAddress: string;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    mintedPkp = await mintPkp(ethersSigner);

    generateWrappedKeyResponse = (await generateWrappedKey(
      mintedPkp!.publicKey,
      "solana"
    )) as GeneratePrivateKeyResult;

    const generateWrappedKeyResponseSchema = {
      title: "GeneratePrivateKeyResponse Schema for Solana Public Key",
      type: "object",
      required: ["pkpAddress", "generatedPublicKey"],
      properties: {
        pkpAddress: {
          type: "string",
          pattern: "^0x[a-fA-F0-9]{40}$",
          const: mintedPkp!.ethAddress,
        },
        generatedPublicKey: {
          type: "string",
          pattern: "^[1-9A-HJ-NP-Za-km-z]{43,44}$",
        },
      },
    };
    expect(generateWrappedKeyResponse).to.be.jsonSchema(
      generateWrappedKeyResponseSchema
    );

    expectedSolanaAddress = new PublicKey(
      generateWrappedKeyResponse.generatedPublicKey
    ).toBase58();
  });

  it("should export a wrapped Solana private key", async () => {
    const exportedPrivateKeyResult = await exportWrappedKey(
      mintedPkp!.publicKey
    );

    const keyPair = Keypair.fromSecretKey(
      Buffer.from(exportedPrivateKeyResult!.decryptedPrivateKey)
    );
    expect(keyPair.publicKey.toBase58()).to.eql(expectedSolanaAddress);
  }).timeout(120_000);
});
