import { expect } from "chai";
import { signMessageWithEncryptedKeyUsingPkp } from "../src/signMessageWithEncryptedKeyUsingPkp";
import { ethers } from "ethers";

const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};
const LIT_PKP_PUBLIC_KEY = getEnv("LIT_PKP_PUBLIC_KEY");
const messageToSign = 'This is a test message using Wrapped Keys';

describe("signWithEncryptedKeyUsingPkp", () => {
  it("should sign and broadcast an ETH transaction on Chronicle", async () => {
    const signature = await signMessageWithEncryptedKeyUsingPkp(LIT_PKP_PUBLIC_KEY);
    console.log(signature);
    // expect(decryptedPrivatekey).to.equal(ETHEREUM_PRIVATE_KEY);
    const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature!);
    console.log(`recoveredAddress- ${recoveredAddress}`);
  }).timeout(30_000);
});
