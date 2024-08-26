import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import * as ethers from "ethers";
import { LIT_RPC } from "@lit-protocol/constants";
import { Keypair } from "@solana/web3.js";
import { ImportPrivateKeyResult } from "@lit-protocol/wrapped-keys";

import { getEnv, mintPkp } from "../src/utils";
import { getWrappedKey } from "../src/getWrappedKey";
import { importKey } from "../src/importKey";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const NEW_ETHEREUM_KEYPAIR_WALLET = ethers.Wallet.createRandom();

describe("Getting Wrapped Key metadata for Ethereum Wrapped Key using getEncryptedKey", () => {
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

    expect(importKeyResult!.pkpAddress).to.equal(mintedPkp!.ethAddress);
  });

  it("should get the metadata for an Ethereum Wrapped Key associated with a PKP", async () => {
    const wrappedKeyMetadataResponseSchema = {
      type: "object",
      required: [
        "ciphertext",
        "dataToEncryptHash",
        "id",
        "keyType",
        "pkpAddress",
        "publicKey",
        "litNetwork",
      ],
      properties: {
        ciphertext: {
          type: "string",
          pattern: "^[A-Za-z0-9+/=]+$",
        },
        dataToEncryptHash: {
          type: "string",
          pattern: "^[a-fA-F0-9]{64}$",
        },
        id: {
          type: "string",
          const: importKeyResult.id,
        },
        keyType: {
          type: "string",
          enum: ["K256"],
        },
        pkpAddress: {
          type: "string",
          const: importKeyResult.pkpAddress,
        },
        publicKey: {
          type: "string",
          const: NEW_ETHEREUM_KEYPAIR_WALLET.publicKey,
        },
        litNetwork: {
          type: "string",
          const: "datil-dev",
        },
      },
      additionalProperties: false,
    };

    const wrappedKeyMetadata = await getWrappedKey(
      mintedPkp!.publicKey,
      importKeyResult.id
    );

    expect(wrappedKeyMetadata).to.be.jsonSchema(
      wrappedKeyMetadataResponseSchema
    );
  }).timeout(120_000);
});

describe("Getting Wrapped Key metadata for Solana Wrapped Key using getEncryptedKey", () => {
  let mintedPkp;
  let solanaKeypair: Keypair;
  let importKeyResult: ImportPrivateKeyResult;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    solanaKeypair = Keypair.generate();

    mintedPkp = await mintPkp(ethersSigner);

    importKeyResult = (await importKey(
      mintedPkp!.publicKey,
      Buffer.from(solanaKeypair.secretKey).toString("hex"),
      solanaKeypair.publicKey.toString(),
      "ed25519",
      "This is a Dev Guide code example testing Solana key"
    )) as ImportPrivateKeyResult;

    expect(importKeyResult.pkpAddress).to.equal(mintedPkp!.ethAddress);
  });

  it("should get the metadata for a Solana Wrapped Key associated with a PKP", async () => {
    const wrappedKeyMetadataResponseSchema = {
      type: "object",
      required: [
        "ciphertext",
        "dataToEncryptHash",
        "id",
        "keyType",
        "pkpAddress",
        "publicKey",
        "litNetwork",
      ],
      properties: {
        ciphertext: {
          type: "string",
          pattern: "^[A-Za-z0-9+/=]+$",
        },
        dataToEncryptHash: {
          type: "string",
          pattern: "^[a-fA-F0-9]{64}$",
        },
        id: {
          type: "string",
          const: importKeyResult.id,
        },
        keyType: {
          type: "string",
          enum: ["ed25519"],
        },
        pkpAddress: {
          type: "string",
          const: importKeyResult.pkpAddress,
        },
        publicKey: {
          type: "string",
          const: solanaKeypair.publicKey.toString(),
        },
        litNetwork: {
          type: "string",
          const: "datil-dev",
        },
      },
      additionalProperties: false,
    };

    const wrappedKeyMetadata = await getWrappedKey(
      mintedPkp!.publicKey,
      importKeyResult.id
    );

    expect(wrappedKeyMetadata).to.be.jsonSchema(
      wrappedKeyMetadataResponseSchema
    );
  }).timeout(120_000);
});
