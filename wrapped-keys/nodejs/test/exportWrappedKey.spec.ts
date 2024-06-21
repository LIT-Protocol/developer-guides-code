import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import * as ethers from "ethers";
import { Keypair, PublicKey } from "@solana/web3.js";

import { getEnv, mintPkp } from "../src/utils";
import { exportWrappedKey } from "../src/exportWrappedKey";
import { importKey } from "../src/importKey";
import { generateWrappedKey } from "../src/generateWrappedKey";
import {
  GeneratePrivateKeyResponse,
  NETWORK_SOLANA,
} from "@lit-protocol/wrapped-keys";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const SOLANA_PRIVATE_KEY = getEnv("SOLANA_PRIVATE_KEY");

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
      ETHEREUM_PRIVATE_KEY
    );

    expect(pkpAddressKeyWasAttachedTo).to.equal(mintedPkp!.ethAddress);
  });

  it("should export a wrapped Ethereum private key", async () => {
    const exportedPrivateKey = await exportWrappedKey(mintedPkp!.publicKey);
    expect(exportedPrivateKey).to.equal(ETHEREUM_PRIVATE_KEY);
  }).timeout(120_000);
});

xdescribe("Exporting a wrapped Solana key using exportPrivateKey", () => {
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
      SOLANA_PRIVATE_KEY
    );

    expect(pkpAddressKeyWasAttachedTo).to.equal(mintedPkp!.ethAddress);
  });

  it("should export a wrapped Solana private key", async () => {
    const exportedPrivateKey = await exportWrappedKey(mintedPkp!.publicKey);
    expect(exportedPrivateKey).to.equal(SOLANA_PRIVATE_KEY);
  }).timeout(120_000);
});

describe("Exporting a generated wrapped Solana key using generatePrivateKey and exportPrivateKey", () => {
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
      NETWORK_SOLANA
    )) as GeneratePrivateKeyResponse;

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
    const exportedPrivateKey = (await exportWrappedKey(
      mintedPkp!.publicKey
    )) as string;

    const keyPair = Keypair.fromSecretKey(Buffer.from(exportedPrivateKey));
    expect(keyPair.publicKey.toBase58()).to.eql(expectedSolanaAddress);
  }).timeout(120_000);
});
