import { EvmContractConditions } from "@lit-protocol/types";
import { expect, use } from "chai";
import { readFileSync } from "fs";


import { encryptFileWithContractConditions } from "../src/encryptFile";
import { decryptFileWithContractConditions } from "../src/decryptFile";

use(require("chai-json-schema"));

describe("Decrypting a file with EVM contract conditions", () => {

  let toEncryptFileBuffer: string;
  let _ciphertext: string;
  let _dataToEncryptHash: string;
  let evmContractConditions: EvmContractConditions;

  before(async function () {
    this.timeout(60_000);

    evmContractConditions = [
      {
        contractAddress: "0x1e1947c7E9761E922d6995EDb8BA59C5471e558F",
        functionName: "hasActiveSubscription",
        functionParams: [":userAddress"],
        functionAbi: {
          inputs: [
            {
              name: "user",
              type: "address",
            },
          ],
          name: "hasActiveSubscription",
          outputs: [
            {
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        chain: "sepolia",
        returnValueTest: {
          key: "",
          comparator: "=",
          value: "true",
        },
      },
    ];

    // @ts-ignore
    const { ciphertext, dataToEncryptHash } =
      await encryptFileWithContractConditions(
        evmContractConditions
      );
    _ciphertext = ciphertext;
    _dataToEncryptHash = dataToEncryptHash;
  });

  it("should decrypt the file", async () => {
    const decryptionResult = await decryptFileWithContractConditions(
      _ciphertext,
      _dataToEncryptHash,
      evmContractConditions
    );
    console.log("✅ Decrypted file:", decryptionResult);
  }).timeout(30_000);
});
