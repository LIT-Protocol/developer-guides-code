import { expect } from "chai";
import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNetwork } from "@lit-protocol/constants";

import { getEnv } from "../src/utils";
import { doTheThing } from "../src";

const ETHEREUM_PRIVATE_KEY_A = getEnv("ETHEREUM_PRIVATE_KEY_A");

describe("Run the example", () => {
  let litContracts: LitContracts;

  before(async function () {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY_A,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.Cayenne,
      debug: false,
    });
    await litContracts.connect();
  });

  it("should return true if the example ran without error", async () => {
    const didTheThing = await doTheThing();
    expect(didTheThing).to.be.true;
  }).timeout(60_000);
});
