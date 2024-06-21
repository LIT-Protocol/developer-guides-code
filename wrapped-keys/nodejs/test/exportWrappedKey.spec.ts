import { expect } from "chai";
import * as ethers from "ethers";

import { getEnv, mintPkp } from "../src/utils";
import { exportWrappedKey } from "../src/exportWrappedKey";
import { importKey } from "../src/importKey";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const SOLANA_PRIVATE_KEY = getEnv("SOLANA_PRIVATE_KEY");

describe("Exporting a wrapped Ethereum key using exportPrivateKey", () => {
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

describe("Exporting a wrapped Solana key using exportPrivateKey", () => {
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
