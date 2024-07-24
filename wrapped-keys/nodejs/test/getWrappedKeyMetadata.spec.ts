import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import * as ethers from "ethers";
import { LIT_RPC } from "@lit-protocol/constants";
import { Keypair } from "@solana/web3.js";

import { getEnv, mintPkp } from "../src/utils";
import { getWrappedKeyMetadata } from "../src/getWrappedKeyMetadata";
import { importKey } from "../src/importKey";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const NEW_ETHEREUM_KEYPAIR_WALLET = ethers.Wallet.createRandom();

describe("Getting Wrapped Key metadata for Ethereum Wrapped Key using getEncryptedKeyMetadata", () => {
  let mintedPkp;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    mintedPkp = await mintPkp(ethersSigner);

    const pkpAddressKeyWasAttachedTo = await importKey(
      mintedPkp!.publicKey,
      NEW_ETHEREUM_KEYPAIR_WALLET.privateKey,
      NEW_ETHEREUM_KEYPAIR_WALLET.publicKey,
      "K256"
    );

    expect(pkpAddressKeyWasAttachedTo).to.equal(mintedPkp!.ethAddress);
  });

  it("should get the metadata for an Ethereum Wrapped Key associated with a PKP", async () => {
    const wrappedKeyMetadataResponseSchema = {
      type: "array",
      items: {
        type: "object",
        required: [
          "ciphertext",
          "dataToEncryptHash",
          "keyType",
          "pkpAddress",
          "publicKey",
          "litNetwork",
        ],
        properties: {
          ciphertext: {
            type: "string",
          },
          dataToEncryptHash: {
            type: "string",
            pattern: "^[a-fA-F0-9]{64}$",
          },
          keyType: {
            type: "string",
            enum: ["K256"],
          },
          pkpAddress: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]{40}$",
          },
          publicKey: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]+$",
          },
          litNetwork: {
            type: "string",
            enum: ["cayenne"],
          },
        },
      },
    };

    const wrappedKeyMetadata = await getWrappedKeyMetadata(
      mintedPkp!.publicKey
    );

    expect(wrappedKeyMetadata).to.be.jsonSchema(
      wrappedKeyMetadataResponseSchema
    );
  }).timeout(120_000);
});

describe("Getting Wrapped Key metadata for Solana Wrapped Key using getEncryptedKeyMetadata", () => {
  let mintedPkp;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    const solanaKeypair = Keypair.generate();

    mintedPkp = await mintPkp(ethersSigner);

    const pkpAddressKeyWasAttachedTo = await importKey(
      mintedPkp!.publicKey,
      Buffer.from(solanaKeypair.secretKey).toString("hex"),
      solanaKeypair.publicKey.toString(),
      "ed25519"
    );

    expect(pkpAddressKeyWasAttachedTo).to.equal(mintedPkp!.ethAddress);
  });

  it("should get the metadata for a Solana Wrapped Key associated with a PKP", async () => {
    const wrappedKeyMetadataResponseSchema = {
      type: "array",
      items: {
        type: "object",
        required: [
          "ciphertext",
          "dataToEncryptHash",
          "keyType",
          "pkpAddress",
          "publicKey",
          "litNetwork",
        ],
        properties: {
          ciphertext: {
            type: "string",
          },
          dataToEncryptHash: {
            type: "string",
            pattern: "^[a-fA-F0-9]{64}$",
          },
          keyType: {
            type: "string",
            enum: ["ed25519"],
          },
          pkpAddress: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]{40}$",
          },
          publicKey: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]+$",
          },
          litNetwork: {
            type: "string",
            enum: ["cayenne"],
          },
        },
      },
    };

    const wrappedKeyMetadata = await getWrappedKeyMetadata(
      mintedPkp!.publicKey
    );
    console.log(wrappedKeyMetadata);

    expect(wrappedKeyMetadata).to.be.jsonSchema(
      wrappedKeyMetadataResponseSchema
    );
  }).timeout(120_000);
});
