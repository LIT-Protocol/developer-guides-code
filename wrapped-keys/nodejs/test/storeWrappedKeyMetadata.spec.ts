import { expect } from "chai";
import * as ethers from "ethers";

import { getEnv, mintPkp } from "../src/utils";
import { storeWrappedKeyMetadata } from "../src/storeWrappedKeyMetadata";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const NEW_ETHEREUM_KEYPAIR_WALLET = ethers.Wallet.createRandom();

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
    const success = await storeWrappedKeyMetadata(
      mintedPkp!.publicKey,
      mintedPkp!.ethAddress,
      NEW_ETHEREUM_KEYPAIR_WALLET.privateKey,
      NEW_ETHEREUM_KEYPAIR_WALLET.publicKey,
      "K256"
    );

    expect(success).true;
  }).timeout(120_000);
});
