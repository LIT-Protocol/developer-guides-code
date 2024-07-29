import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

import { getEnv } from "../src/utils";
import { runExample } from "../src";

use(chaiJsonSchema);

const SOLANA_PRIVATE_KEY = getEnv("SOLANA_PRIVATE_KEY");

describe("Testing specific functionality", () => {
  let solanaKeyPair: Keypair;

  before(async function () {
    this.timeout(120_000);

    solanaKeyPair = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY));
  });

  it("should test for a specific thing", async () => {
    const result = await runExample(solanaKeyPair);
    console.log("result", result);
  }).timeout(120_000);
});
