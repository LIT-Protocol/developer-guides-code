import { expect } from "chai";
import { signWithEncryptedKeyUsingPkp } from "../src/signWithEncryptedKeyUsingPkp";

const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};
const LIT_PKP_PUBLIC_KEY = getEnv("LIT_PKP_PUBLIC_KEY");

describe("signWithEncryptedKeyUsingPkp", () => {
  it("should sign and broadcast an ETH transaction on Chronicle", async () => {
    const foo = await signWithEncryptedKeyUsingPkp(LIT_PKP_PUBLIC_KEY);
    console.log(foo);
    // expect(decryptedPrivatekey).to.equal(ETHEREUM_PRIVATE_KEY);
  }).timeout(30_000);
});
