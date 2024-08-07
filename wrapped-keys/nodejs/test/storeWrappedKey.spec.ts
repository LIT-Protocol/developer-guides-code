import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import * as ethers from "ethers";
import { LIT_RPC } from "@lit-protocol/constants";
import { Keypair } from "@solana/web3.js";

import { getEnv, mintPkp } from "../src/utils";
import { storeWrappedKey } from "../src/storeWrappedKey";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const NEW_ETHEREUM_KEYPAIR_WALLET = ethers.Wallet.createRandom();

describe("Importing an Ethereum key using importPrivateKey", () => {
  let ethersSigner: ethers.Wallet;
  let mintedPkp;

  before(async function () {
    this.timeout(120_000);
    ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    mintedPkp = await mintPkp(ethersSigner);
  });

  it("should import an Ethereum key and attach it to a new PKP", async () => {
    const storeWrappedKeyResponseSchema = {
      type: "object",
      required: ["pkpAddress", "id"],
      properties: {
        pkpAddress: {
          type: "string",
          pattern: mintedPkp!.ethAddress,
        },
        id: {
          type: "string",
          pattern:
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        },
      },
      additionalProperties: false,
    };

    const result = await storeWrappedKey(
      mintedPkp!.publicKey,
      mintedPkp!.ethAddress,
      NEW_ETHEREUM_KEYPAIR_WALLET.privateKey,
      NEW_ETHEREUM_KEYPAIR_WALLET.publicKey,
      "K256",
      "This is a Dev Guide code example testing Ethereum key"
    );

    expect(result).to.be.jsonSchema(storeWrappedKeyResponseSchema);
  }).timeout(120_000);
});

describe("Importing a Solana key using importPrivateKey", () => {
  let ethersSigner: ethers.Wallet;
  let solanaKeypair: Keypair;
  let mintedPkp;

  before(async function () {
    this.timeout(120_000);
    ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    solanaKeypair = Keypair.generate();

    mintedPkp = await mintPkp(ethersSigner);
  });

  it("should import a Solana key and attach it to a new PKP", async () => {
    const storeWrappedKeyResponseSchema = {
      type: "object",
      required: ["pkpAddress", "id"],
      properties: {
        pkpAddress: {
          type: "string",
          pattern: mintedPkp!.ethAddress,
        },
        id: {
          type: "string",
          pattern:
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        },
      },
      additionalProperties: false,
    };

    const result = await storeWrappedKey(
      mintedPkp!.publicKey,
      mintedPkp!.ethAddress,
      Buffer.from(solanaKeypair.secretKey).toString("hex"),
      solanaKeypair.publicKey.toString(),
      "ed25519",
      "This is a Dev Guide code example testing Solana key"
    );

    expect(result).to.be.jsonSchema(storeWrappedKeyResponseSchema);
  }).timeout(120_000);
});
