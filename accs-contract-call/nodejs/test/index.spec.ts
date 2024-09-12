import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import { ethers } from "ethers";
import { LIT_RPC } from "@lit-protocol/constants";

import { getEnv } from "../src/utils";
import { runExample } from "../src";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const DEPLOYED_ACCESS_CONTROL_CONTRACT_ADDRESS = getEnv(
  "DEPLOYED_ACCESS_CONTROL_CONTRACT_ADDRESS"
);

describe("Testing specific functionality", () => {
  const SECRET_STRING = "the answer to the universe is 42";
  const ethersWallet = new ethers.Wallet(
    ETHEREUM_PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
  );
  const accessControlContract = new ethers.Contract(
    DEPLOYED_ACCESS_CONTROL_CONTRACT_ADDRESS,
    [
      {
        inputs: [],
        name: "grantAccess",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "revokeAccess",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    ethersWallet
  );

  it("should decrypt the secret string because access has been granted", async () => {
    const tx = await accessControlContract.grantAccess();
    await tx.wait();

    const decryptedString = await runExample(SECRET_STRING);
    expect(decryptedString).to.equal(SECRET_STRING);
  }).timeout(120_000);

  it("shouldn't decrypt the secret string because access has been revoked", async () => {
    const tx = await accessControlContract.revokeAccess();
    await tx.wait();

    let response;
    try {
      response = await runExample(SECRET_STRING);
    } catch (error) {
      response = error;
    }

    const notAuthorizedResponseSchema = {
      type: "object",
      required: [
        "message",
        "errorCode",
        "errorKind",
        "status",
        "details",
        "requestId",
      ],
      properties: {
        message: {
          type: "string",
        },
        errorCode: {
          type: "string",
          enum: ["NodeAccessControlConditionsReturnedNotAuthorized"],
        },
        errorKind: {
          type: "string",
          enum: ["Validation"],
        },
        status: {
          type: "number",
          enum: [401],
        },
        details: {
          type: "array",
          items: {
            type: "string",
          },
          minItems: 1,
        },
        requestId: {
          type: "string",
          pattern: "^[a-f0-9]+$",
        },
      },
    };
    expect(response).to.be.jsonSchema(notAuthorizedResponseSchema);
  }).timeout(120_000);
});
