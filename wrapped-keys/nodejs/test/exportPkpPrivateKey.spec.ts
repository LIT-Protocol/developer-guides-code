import { expect } from "chai";
import {
  importKeyAndGetPkpAddress,
  mintPkp,
} from "../src/importKeyAndGetPkpAddress";
import * as ethers from "ethers";
import { exportPkpPrivateKey } from "../src/exportPkpPrivateKey";

const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};
const LIT_PKP_PUBLIC_KEY = getEnv("LIT_PKP_PUBLIC_KEY");
const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("exportPkpPrivateKey", () => {
  it("should return the expected decrypted private key", async () => {
    const decryptedPrivatekey = await exportPkpPrivateKey(LIT_PKP_PUBLIC_KEY);
    expect(decryptedPrivatekey).to.equal(ETHEREUM_PRIVATE_KEY);
  }).timeout(30_000);
});
