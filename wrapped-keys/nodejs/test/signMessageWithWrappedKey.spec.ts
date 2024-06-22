import { expect, use } from "chai";
import * as ethers from "ethers";
import chaiJsonSchema from "chai-json-schema";
import {
  GeneratePrivateKeyResponse,
  LitTransaction,
  NETWORK_EVM,
  NETWORK_SOLANA,
  SolanaLitTransaction,
} from "@lit-protocol/wrapped-keys";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";

import { getEnv, mintPkp } from "../src/utils";
import { generateWrappedKey } from "../src/generateWrappedKey";
import { signMessageWithWrappedKey } from "../src/signMessageWithWrappedKey";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Signing an Ethereum message using generateWrappedKey and signMessageWithEncryptedKey", () => {
  let mintedPkp;
  let expectedWrappedKeyEthAddress: string;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    mintedPkp = await mintPkp(ethersSigner);

    const generateWrappedKeyResponseSchema = {
      title: "GeneratePrivateKeyResponse Schema for EVM Public Key",
      type: "object",
      required: ["pkpAddress", "generatedPublicKey"],
      properties: {
        pkpAddress: {
          type: "string",
          pattern: "^0x[a-fA-F0-9]{40}$",
          const: mintedPkp!.ethAddress,
        },
        generatedPublicKey: {
          type: "string",
          pattern: "^0x04[a-fA-F0-9]{128}$",
        },
      },
    };

    const generateWrappedKeyResponse = (await generateWrappedKey(
      mintedPkp!.publicKey,
      NETWORK_EVM
    )) as GeneratePrivateKeyResponse;
    expect(generateWrappedKeyResponse).to.be.jsonSchema(
      generateWrappedKeyResponseSchema
    );

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
      NETWORK_EVM,
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

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    mintedPkp = await mintPkp(ethersSigner);

    const generateWrappedKeyResponseSchema = {
      title: "GeneratePrivateKeyResponse Schema for Solana Public Key",
      type: "object",
      required: ["pkpAddress", "generatedPublicKey"],
      properties: {
        pkpAddress: {
          type: "string",
          pattern: "^0x[a-fA-F0-9]{40}$",
          const: mintedPkp!.ethAddress,
        },
        generatedPublicKey: {
          type: "string",
          pattern: "^[1-9A-HJ-NP-Za-km-z]{43,44}$",
        },
      },
    };

    const generateWrappedKeyResponse = (await generateWrappedKey(
      mintedPkp!.publicKey,
      NETWORK_SOLANA
    )) as GeneratePrivateKeyResponse;
    expect(generateWrappedKeyResponse).to.be.jsonSchema(
      generateWrappedKeyResponseSchema
    );

    generatedSolanaPublicKey = new PublicKey(
      generateWrappedKeyResponse.generatedPublicKey
    );
  });

  it("should sign a Solana message", async () => {
    const messageToSign = "The answer to the universe is 42";

    const signedMessage = (await signMessageWithWrappedKey(
      mintedPkp!.publicKey,
      NETWORK_SOLANA,
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
