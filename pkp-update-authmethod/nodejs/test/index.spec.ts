import { expect } from "chai";
import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNetwork } from "@lit-protocol/constants";

import { getEnv } from "../src/utils";
import { doTheThing } from "../src";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Foo", () => {
  let litContracts: LitContracts;

  before(async function () {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
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

  it("should", async () => {
    const mintedPkp = await doTheThing();
    console.log(mintedPkp);

    const result = await litContracts.pkpNftContract.read.ownerOf(
      mintedPkp?.tokenId
    );
    console.log(result);
  }).timeout(60_000);
});
