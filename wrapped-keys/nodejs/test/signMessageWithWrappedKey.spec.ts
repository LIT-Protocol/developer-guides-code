import { expect, use } from "chai";
import * as ethers from "ethers";
import chaiJsonSchema from "chai-json-schema";
import { GeneratePrivateKeyResult } from "@lit-protocol/wrapped-keys";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { LIT_RPC } from "@lit-protocol/constants";

import { getEnv, mintPkp } from "../src/utils";
import { generateWrappedKey } from "../src/generateWrappedKey";
import { signMessageWithWrappedKey } from "../src/signMessageWithWrappedKey";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Signing an Ethereum message using generateWrappedKey and signMessageWithEncryptedKey", () => {
  let mintedPkp;
  let expectedWrappedKeyEthAddress: string;
  let generateWrappedKeyResponse: GeneratePrivateKeyResult;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    mintedPkp = await mintPkp(ethersSigner);

    generateWrappedKeyResponse = (await generateWrappedKey(
      mintedPkp!.publicKey,
      "evm",
      "This is a Dev Guide code example testing Ethereum key"
    )) as GeneratePrivateKeyResult;

    console.log("generateWrappedKeyResponse", generateWrappedKeyResponse);

    const sanitizedPublicKey =
      generateWrappedKeyResponse.generatedPublicKey.slice(
        generateWrappedKeyResponse.generatedPublicKey.startsWith("0x04") ? 4 : 2
      );
    const addressHash = ethers.utils.keccak256(`0x${sanitizedPublicKey}`);
    expectedWrappedKeyEthAddress = ethers.utils.getAddress(
      `0x${addressHash.substring(addressHash.length - 40)}`
    );
  });

  it("should sign an Ethereum message", async () => {
    const messageToSign = ethers.utils.toUtf8Bytes(
      "The answer to the universe is 42"
    );

    const signedMessage = (await signMessageWithWrappedKey(
      mintedPkp!.publicKey,
      "evm",
      generateWrappedKeyResponse.id,
      messageToSign
    )) as string;

    expect(signedMessage).to.match(RegExp("^0x[a-fA-F0-9]"));

    const recoveredAddressFromSig = ethers.utils.verifyMessage(
      messageToSign,
      signedMessage
    );
    expect(recoveredAddressFromSig).to.eql(expectedWrappedKeyEthAddress);
  }).timeout(120_000);
});

describe("Signing a Solana message using generateWrappedKey and signMessageWithEncryptedKey", () => {
  let mintedPkp;
  let generatedSolanaPublicKey: PublicKey;
  let generateWrappedKeyResponse: GeneratePrivateKeyResult;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    mintedPkp = await mintPkp(ethersSigner);

    generateWrappedKeyResponse = (await generateWrappedKey(
      mintedPkp!.publicKey,
      "solana",
      "This is a Dev Guide code example testing Solana key"
    )) as GeneratePrivateKeyResult;

    generatedSolanaPublicKey = new PublicKey(
      generateWrappedKeyResponse.generatedPublicKey
    );
  });

  it("should sign a Solana message", async () => {
    const messageToSign = "The answer to the universe is 42";

    const signedMessage = (await signMessageWithWrappedKey(
      mintedPkp!.publicKey,
      "solana",
      generateWrappedKeyResponse.id,
      messageToSign
    )) as string;

    expect(signedMessage).to.match(RegExp("^[A-Za-z0-9+/]+={0,2}$"));

    const signatureIsValidForPublicKey = nacl.sign.detached.verify(
      Buffer.from(messageToSign),
      bs58.decode(signedMessage),
      generatedSolanaPublicKey.toBuffer()
    );

    expect(signatureIsValidForPublicKey).to.be.true;
  }).timeout(120_000);
});
