import { expect } from "chai";
import * as ethers from "ethers";
import { LIT_RPC } from "@lit-protocol/constants";
import { Keypair } from "@solana/web3.js";

import { getEnv, mintPkp } from "../src/utils";
import { importKey } from "../src/importKey";

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
    const pkpAddressKeyWasAttachedTo = await importKey(
      mintedPkp!.publicKey,
      NEW_ETHEREUM_KEYPAIR_WALLET.privateKey,
      NEW_ETHEREUM_KEYPAIR_WALLET.publicKey,
      "K256"
    );

    expect(pkpAddressKeyWasAttachedTo).to.equal(mintedPkp!.ethAddress);
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
    const pkpAddressKeyWasAttachedTo = await importKey(
      mintedPkp!.publicKey,
      Buffer.from(solanaKeypair.secretKey).toString("hex"),
      solanaKeypair.publicKey.toBase58(),
      "K256"
    );

    expect(pkpAddressKeyWasAttachedTo).to.equal(mintedPkp!.ethAddress);
  }).timeout(120_000);
});
