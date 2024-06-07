import { expect } from "chai";
import {
  importKeyAndGetPkpAddress,
  mintPkp,
} from "../src/importKeyAndGetPkpAddress";
import * as ethers from "ethers";

const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};
const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("importKeyAndGetPkpAddress", () => {
  it("should return the same PKP address from importPrivateKey", async () => {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );
    const mintedPkp = await mintPkp(ethersSigner);

    const pkpAddress = await importKeyAndGetPkpAddress(mintedPkp!.publicKey);
    expect(pkpAddress).to.equal(mintedPkp!.ethAddress);
  }).timeout(30_000);
});
