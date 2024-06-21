import { expect, use } from "chai";
import * as ethers from "ethers";
import chaiJsonSchema from "chai-json-schema";

import { getEnv, mintPkp } from "../src/utils";
import { generateWrappedKey } from "../src/generateWrappedKey";
import {
  GeneratePrivateKeyResponse,
  NETWORK_EVM,
  NETWORK_SOLANA,
} from "@lit-protocol/wrapped-keys";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Generating an Ethereum Wrapped Key using generatePrivateKey", () => {
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
  });

  it("should generate an Ethereum Wrapped Key and attach it to a new PKP", async () => {
    const responseSchema = {
      title: "GeneratePrivateKeyResponse Schema for EVM Public Key",
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
          pattern: "^0x04[a-fA-F0-9]{128}$",
        },
      },
    };

    const response = (await generateWrappedKey(
      mintedPkp!.publicKey,
      NETWORK_EVM
    )) as GeneratePrivateKeyResponse;
    expect(response).to.be.jsonSchema(responseSchema);
  }).timeout(120_000);
});

describe("Generating a Solana Wrapped Key using generatePrivateKey", () => {
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
  });

  it("should generate a Solana Wrapped Key and attach it to a new PKP", async () => {
    const responseSchema = {
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

    const response = (await generateWrappedKey(
      mintedPkp!.publicKey,
      NETWORK_SOLANA
    )) as GeneratePrivateKeyResponse;
    expect(response).to.be.jsonSchema(responseSchema);
  }).timeout(120_000);
});
