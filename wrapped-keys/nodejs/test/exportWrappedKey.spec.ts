import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import * as ethers from "ethers";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import {
  GeneratePrivateKeyResult,
  ImportPrivateKeyResult,
} from "@lit-protocol/wrapped-keys";
import { LIT_RPC } from "@lit-protocol/constants";

import { getEnv, mintPkp } from "../src/utils";
import { exportWrappedKey } from "../src/exportWrappedKey";
import { importKey } from "../src/importKey";
import { generateWrappedKey } from "../src/generateWrappedKey";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const NEW_ETHEREUM_KEYPAIR_WALLET = ethers.Wallet.createRandom();
const NEW_SOLANA_PRIVATE_KEY = Keypair.generate().secretKey;

describe("Exporting a wrapped Ethereum key using exportPrivateKey", () => {
  let mintedPkp;
  let importKeyResult: ImportPrivateKeyResult;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    mintedPkp = await mintPkp(ethersSigner);

    importKeyResult = (await importKey(
      mintedPkp!.publicKey,
      NEW_ETHEREUM_KEYPAIR_WALLET.privateKey,
      NEW_ETHEREUM_KEYPAIR_WALLET.publicKey,
      "K256",
      "This is a Dev Guide code example testing Ethereum key"
    )) as ImportPrivateKeyResult;

    expect(importKeyResult.pkpAddress).to.equal(mintedPkp!.ethAddress);
  });

  it("should export a wrapped Ethereum private key", async () => {
    const exportedPrivateKeyResultSchema = {
      type: "object",
      required: [
        "decryptedPrivateKey",
        "pkpAddress",
        "id",
        "keyType",
        "publicKey",
        "litNetwork",
      ],
      properties: {
        decryptedPrivateKey: {
          type: "string",
          const: NEW_ETHEREUM_KEYPAIR_WALLET.privateKey,
        },
        pkpAddress: {
          type: "string",
          const: mintedPkp!.ethAddress,
        },
        id: {
          type: "string",
          pattern:
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        },
        keyType: {
          type: "string",
          enum: ["K256"],
        },
        publicKey: {
          type: "string",
          const: NEW_ETHEREUM_KEYPAIR_WALLET.publicKey,
        },
        litNetwork: {
          const: "datil-dev",
        },
      },
    };

    const result = await exportWrappedKey(
      mintedPkp!.publicKey,
      importKeyResult.id,
      "evm"
    );
    expect(result).to.be.jsonSchema(exportedPrivateKeyResultSchema);
  }).timeout(120_000);
});

describe("Exporting a wrapped Solana key using exportPrivateKey", () => {
  let mintedPkp;
  let solanaKeypair: Keypair;
  let importKeyResult: ImportPrivateKeyResult;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    solanaKeypair = Keypair.fromSecretKey(NEW_SOLANA_PRIVATE_KEY);

    mintedPkp = await mintPkp(ethersSigner);

    importKeyResult = (await importKey(
      mintedPkp!.publicKey,
      bs58.encode(NEW_SOLANA_PRIVATE_KEY),
      solanaKeypair.publicKey.toString(),
      "ed25519",
      "This is a Dev Guide code example testing Solana key"
    )) as ImportPrivateKeyResult;

    expect(importKeyResult.pkpAddress).to.equal(mintedPkp!.ethAddress);
  });

  it("should export a wrapped Solana private key", async () => {
    const exportedPrivateKeyResultSchema = {
      type: "object",
      required: [
        "decryptedPrivateKey",
        "pkpAddress",
        "id",
        "keyType",
        "publicKey",
        "litNetwork",
      ],
      properties: {
        decryptedPrivateKey: {
          type: "string",
          const: Keypair.fromSecretKey(
            NEW_SOLANA_PRIVATE_KEY
          ).publicKey.toString(),
        },
        pkpAddress: {
          type: "string",
          const: solanaKeypair.publicKey.toString(),
        },
        id: {
          type: "string",
          pattern:
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        },
        keyType: {
          type: "string",
          enum: ["ed25519"],
        },
        publicKey: {
          type: "string",
          const: solanaKeypair.publicKey.toString(),
        },
        litNetwork: {
          const: "datil-dev",
        },
      },
    };

    const result = await exportWrappedKey(
      mintedPkp!.publicKey,
      importKeyResult.id,
      "solana"
    );
    expect(result).to.be.jsonSchema(exportedPrivateKeyResultSchema);
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
      mintedPkp!.publicKey,
      "solana"
    );

    const keyPair = Keypair.fromSecretKey(
      Buffer.from(exportedPrivateKeyResult!.decryptedPrivateKey)
    );
    expect(keyPair.publicKey.toBase58()).to.eql(expectedSolanaAddress);
  }).timeout(120_000);
});
