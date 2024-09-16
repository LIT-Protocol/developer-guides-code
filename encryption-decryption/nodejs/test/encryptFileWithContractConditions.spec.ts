import { expect, use } from "chai";
import { readFileSync } from "fs";
import path from "path";

import { encryptFileWithContractConditions } from "../src/encryptFile";
import deployedAllowList from "./fixtures/deployed.json";

use(require("chai-json-schema"));

const FILE_TO_ENCRYPT_PATH = path.join(__dirname, "fileToEncrypt.txt");
const FAKE_TOKEN_ID = 42;

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
      new Blob([toEncryptFileBuffer], { type: "text/plain" }),
      [
        {
          contractAddress: deployedAllowList.address,
          chain: "yellowstone",
          functionName: "isOnAllowlist",
          functionParams: [":userAddress", FAKE_TOKEN_ID.toString()],
          functionAbi: {
            inputs: [
              {
                internalType: "address",
                name: "account",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            name: "isOnAllowlist",
            outputs: [
              {
                internalType: "bool",
                name: "",
                type: "bool",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          returnValueTest: {
            key: "0",
            comparator: "=",
            value: "true",
          },
        },
      ]
    );
    expect(encryptionResult).to.be.jsonSchema(encryptionResponseSchema);
  }).timeout(30_000);
});
