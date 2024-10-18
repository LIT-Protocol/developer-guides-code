import { EvmContractConditions } from "@lit-protocol/types";
import { LIT_RPC } from "@lit-protocol/constants";
import { expect, use } from "chai";
import * as ethers from "ethers";
import { readFileSync } from "fs";
import path from "path";

import { getEnv } from "../src/utils";

import { encryptFileWithContractConditions } from "../src/encryptFile";
import { decryptFileWithContractConditions } from "../src/decryptFile";

use(require("chai-json-schema"));

const FILE_TO_ENCRYPT_PATH = path.join(__dirname, "fileToEncrypt.txt");
const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Decrypting a file with EVM contract conditions", () => {

  let toEncryptFileBuffer: string;
  let _ciphertext: string;
  let _dataToEncryptHash: string;
  let evmContractConditions: EvmContractConditions;

  before(async function () {
    this.timeout(60_000);

    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    const message = "Hello, Ethereum!";
    const signature = await ethersSigner.signMessage(message);
    console.log(`Signature: ${signature}`);
    const messageHash = ethers.utils.hashMessage(message);
    console.log(`Signature hash: ${messageHash}`);

    evmContractConditions = [
      {
        contractAddress: '0xec989963a17a6801A8A1cEc8DF195121B02e0d0B',
        functionName: "isValidSignature",
        functionParams: [
          ":userAddress",   // _signer
          messageHash,   // _hash
          signature,   // _signature
        ],
        functionAbi: {
          inputs: [
            {
              internalType: "address",
              name: "_signer",
              type: "address"
            },
            {
              internalType: "bytes32",
              name: "_hash",
              type: "bytes32"
            },
            {
              internalType: "bytes",
              name: "_signature",
              type: "bytes"
            }
          ],
          name: "isValidSignature",
          outputs: [
            {
              internalType: "bool",
              name: "isValid",
              type: "bool"
            }
          ],
          stateMutability: "pure",
          type: "function"
        },
        chain: "yellowstone",
        returnValueTest: {
          key: "",
          comparator: "=",
          value: "true",
        },
      },
    ];

    console.log(`🔄 Reading file: ${FILE_TO_ENCRYPT_PATH}...`);
    toEncryptFileBuffer = readFileSync(FILE_TO_ENCRYPT_PATH, "utf8");
    console.log("✅ Read file");

    // @ts-ignore
    const { ciphertext, dataToEncryptHash } =
      await encryptFileWithContractConditions(
        new Blob([toEncryptFileBuffer], { type: "text/plain" }),
        evmContractConditions as EvmContractConditions
      );
    _ciphertext = ciphertext;
    _dataToEncryptHash = dataToEncryptHash;
  });

  it("should decrypt the file", async () => {
    const decryptionResult = await decryptFileWithContractConditions(
      _ciphertext,
      _dataToEncryptHash,
      evmContractConditions as EvmContractConditions
    );
    console.log(Buffer.from(decryptionResult!).toString("utf8"));
  }).timeout(30_000);
});
