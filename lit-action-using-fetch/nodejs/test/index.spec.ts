import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import { LIT_RPC } from "@lit-protocol/constants";
import ethers from "ethers";

import { getEnv, mintPkp } from "../src/utils";
import { runExample } from "../src";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Testing specific functionality", () => {
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

  it("should test for a specific thing", async () => {
    const response = await runExample(mintedPkp!.publicKey);
    console.log(response);
  }).timeout(120_000);
});
