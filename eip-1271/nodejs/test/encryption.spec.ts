import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import { AccsEVMParams, SessionSigsMap } from "@lit-protocol/types";
import { ethers } from "ethers";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

import { getEnv } from "../src/utils";
import { runExample } from "../src";

const DEPLOYED_EIP1271_WHITELIST_CONTRACT = getEnv(
  "DEPLOYED_EIP1271_WHITELIST_CONTRACT"
);
const LIT_NETWORK = LitNetwork.DatilTest;
const LIT_RPC_URL = LIT_RPC.CHRONICLE_YELLOWSTONE;
const EIP_1271_MAGIC_VALUE =
  "0x1626ba7e00000000000000000000000000000000000000000000000000000000";

use(chaiJsonSchema);

describe("EIP-1271 Encryption Example", () => {
  const MESSAGE_HASH = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("The answer to the universe is 42.")
  );
  const STRING_TO_ENCRYPT = "Test value";

  let sessionSigs: SessionSigsMap;

  before(async function () {
    this.timeout(120_000);
    const expectedSessionSigsSchema = {
      type: "object",
      patternProperties: {
        "^https://[0-9.]+:[0-9]+$": {
          type: "object",
          required: ["sig", "derivedVia", "signedMessage", "address", "algo"],
          properties: {
            sig: {
              type: "string",
              pattern: "^[a-f0-9]{128}$",
            },
            derivedVia: {
              type: "string",
              enum: ["litSessionSignViaNacl"],
            },
            signedMessage: {
              type: "string",
              pattern: "^\\{.*\\}$",
            },
            address: {
              type: "string",
              pattern: "^[a-f0-9]{64}$",
            },
            algo: {
              type: "string",
              enum: ["ed25519"],
            },
          },
        },
      },
      additionalProperties: false,
    };
    sessionSigs = (await runExample()) as SessionSigsMap;
    expect(sessionSigs).to.be.jsonSchema(expectedSessionSigsSchema);
  });

  it("should decrypt string", async () => {
    let litNodeClient: LitNodeClient;

    try {
      const signaturesInterface = [
        "function signatures(bytes32) public view returns (bytes)",
      ];
      const deployedEip1271Contract = new ethers.Contract(
        DEPLOYED_EIP1271_WHITELIST_CONTRACT,
        signaturesInterface,
        new ethers.providers.JsonRpcProvider(LIT_RPC_URL)
      );
      const multiSigSignatures = await deployedEip1271Contract.signatures(
        MESSAGE_HASH
      );

      litNodeClient = new LitNodeClient({
        litNetwork: LIT_NETWORK,
        debug: true,
      });
      await litNodeClient.connect();

      const evmContractConditions: AccsEVMParams[] = [
        {
          contractAddress: DEPLOYED_EIP1271_WHITELIST_CONTRACT,
          chain: "yellowstone",
          functionName: "isValidSignature",
          functionParams: [MESSAGE_HASH, multiSigSignatures],
          functionAbi: {
            type: "function",
            name: "isValidSignature",
            inputs: [
              { name: "_hash", type: "bytes32", internalType: "bytes32" },
              { name: "_signatures", type: "bytes", internalType: "bytes" },
            ],
            outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
            stateMutability: "view",
          },
          returnValueTest: {
            key: "",
            comparator: "=",
            value: EIP_1271_MAGIC_VALUE,
          },
        },
      ];
      const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
        dataToEncrypt: ethers.utils.toUtf8Bytes(STRING_TO_ENCRYPT),
        evmContractConditions,
      });

      const decryptedString = await litNodeClient.decrypt({
        ciphertext,
        dataToEncryptHash,
        chain: "ethereum",
        sessionSigs,
        evmContractConditions,
      });
      console.log(decryptedString);
    } finally {
      litNodeClient!.disconnect();
    }
  }).timeout(120_000);
});
