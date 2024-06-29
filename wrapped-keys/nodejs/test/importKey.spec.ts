import { expect } from "chai";
import * as ethers from "ethers";

import { getEnv, mintPkp } from "../src/utils";
import { importKey } from "../src/importKey";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Importing an Ethereum key using importPrivateKey", () => {
  let ethersSigner: ethers.Wallet;
  let mintedPkp;

  before(async function () {
    this.timeout(120_000);
    ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    mintedPkp = await mintPkp(ethersSigner);
  });

  it("should import an Ethereum key and attach it to a new PKP", async () => {
    const pkpAddressKeyWasAttachedTo = await importKey(
      mintedPkp!.publicKey,
      ETHEREUM_PRIVATE_KEY,
      ethersSigner.publicKey,
      "K256"
    );

    expect(pkpAddressKeyWasAttachedTo).to.equal(mintedPkp!.ethAddress);
  }).timeout(120_000);
});
