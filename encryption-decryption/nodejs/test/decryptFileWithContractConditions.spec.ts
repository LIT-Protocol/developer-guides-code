import { EvmContractConditions } from "@lit-protocol/types";
import { LIT_RPC } from "@lit-protocol/constants";
import { expect, use } from "chai";
import * as ethers from "ethers";
import { readFileSync } from "fs";
import path from "path";

import { getEnv } from "../src/utils";
import deployedAllowList from "./fixtures/deployed.json";
import { encryptFileWithContractConditions } from "../src/encryptFile";
import { decryptFileWithContractConditions } from "../src/decryptFile";

use(require("chai-json-schema"));

const FILE_TO_ENCRYPT_PATH = path.join(__dirname, "fileToEncrypt.txt");
const FAKE_TOKEN_ID = 42;
const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Decrypting a file with EVM contract conditions", () => {
  const evmContractConditions = [
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
        key: "",
        comparator: "=",
        value: "true",
      },
    },
  ];

  let toEncryptFileBuffer: string;
  let _ciphertext: string;
  let _dataToEncryptHash: string;

  before(async function () {
    this.timeout(60_000);

    console.log(`🔄 Reading file: ${FILE_TO_ENCRYPT_PATH}...`);
    toEncryptFileBuffer = readFileSync(FILE_TO_ENCRYPT_PATH, "utf8");
    console.log("✅ Read file");

    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );
    const allowListContract = new ethers.Contract(
      deployedAllowList.address,
      deployedAllowList.abi,
      ethersSigner
    );

    console.log(`🔄 Checking if ${ethersSigner.address} is on allow list...`);
    let isAllowed = await allowListContract.isOnAllowlist(
      ethersSigner.address,
      FAKE_TOKEN_ID
    );

    if (!isAllowed) {
      console.log(`⚠️  ${ethersSigner.address} not on allow list`);
      console.log(`🔄 Adding ${ethersSigner.address} to allow list...`);
      const tx = await allowListContract.addToAllowlist(
        FAKE_TOKEN_ID,
        ethersSigner.address
      );
      const receipt = await tx.wait();
      console.log(
        `✅ Added ${ethersSigner.address} to allow list. Tx hash: ${receipt.transactionHash}`
      );
    } else {
      console.log(`✅ ${ethersSigner.address} is on allow list`);
    }

    isAllowed = await allowListContract.isOnAllowlist(
      ethersSigner.address,
      FAKE_TOKEN_ID
    );
    expect(isAllowed).true;

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
