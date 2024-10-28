import { expect, use } from "chai";
import { readFileSync } from "fs";
import path from "path";

import { encryptFileWithContractConditions } from "../src/encryptFile";

use(require("chai-json-schema"));

const FILE_TO_ENCRYPT_PATH = path.join(__dirname, "fileToEncrypt.txt");

describe("Encrypting a file with EVM contract conditions", () => {
  let toEncryptFileBuffer: string;

  before(async function () {
    this.timeout(60_000);

    console.log(`🔄 Reading file: ${FILE_TO_ENCRYPT_PATH}...`);
    toEncryptFileBuffer = readFileSync(FILE_TO_ENCRYPT_PATH, "utf8");
    console.log("✅ Read file");
  });

  it("should encrypt the file", async () => {
    const encryptionResponseSchema = {
      title: "Response Schema",
      type: "object",
      required: ["ciphertext", "dataToEncryptHash"],
      properties: {
        ciphertext: {
          type: "string",
          pattern: "^[A-Za-z0-9+/=]+$",
        },
        dataToEncryptHash: {
          type: "string",
          pattern: "^[a-f0-9]{64}$",
        },
      },
    };
    const encryptionResult = await encryptFileWithContractConditions(
      new Blob([toEncryptFileBuffer], { type: "text/plain" }), [
        {
          contractAddress: '0xec989963a17a6801A8A1cEc8DF195121B02e0d0B',
          functionName: "isValidSignature",
          functionParams: [
            ":userAddress",   // _signer
            ":messageHash",   // _hash
            ":signature"      // _signature
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
      ]
    );
    expect(encryptionResult).to.be.jsonSchema(encryptionResponseSchema);
  }).timeout(30_000);
});
