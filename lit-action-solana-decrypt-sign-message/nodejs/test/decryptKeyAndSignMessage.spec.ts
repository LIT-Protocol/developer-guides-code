import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { expect } from "chai";

import { decryptKeyAndSignMessage } from "../src";

const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

const SOLANA_PRIVATE_KEY = getEnv("SOLANA_PRIVATE_KEY");

describe("decryptKeyAndSignMessage", () => {
  it("should decrypt the Solana private key and sign the message within a Lit Action", async () => {
    const messageToSign = "The answer to the universe is 42";
    const solanaKeyPair = Keypair.fromSecretKey(
      bs58.decode(SOLANA_PRIVATE_KEY)
    );

    const signature = await decryptKeyAndSignMessage(messageToSign);
    console.log(`Received the signature: ${signature}`);

    const isValid = nacl.sign.detached.verify(
      Buffer.from(messageToSign),
      bs58.decode(signature as string),
      solanaKeyPair.publicKey.toBuffer()
    );

    expect(isValid).to.be.true;
  }).timeout(30_000);
});
