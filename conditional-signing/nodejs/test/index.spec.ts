import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import { ethers } from "ethers";

import { conditionalSigning } from "../src/index";

use(chaiJsonSchema);

describe("conditionalSigning", () => {
  const conditionalSigningResponseSchemaFunded = {
    type: "object",
    properties: {
      claims: { type: "object" },
      signatures: {
        type: "object",
        properties: {
          sig: {
            type: "object",
            properties: {
              r: { type: "string" },
              s: { type: "string" },
              recid: { type: "number" },
              signature: { type: "string" },
              publicKey: { type: "string" },
              dataSigned: { type: "string" },
            },
          },
        },
      },
      response: {
        type: "string",
        pattern: "^$",
      },
      logs: {
        type: "string",
        pattern: "^$",
      },
    },
    required: ["claims", "signatures", "response", "logs"],
    additionalProperties: false,
  };

  it("Should succeed with a funded account", async () => {
    const signedTx = await conditionalSigning();
    expect(signedTx).to.be.jsonSchema(conditionalSigningResponseSchemaFunded);
  }).timeout(100_000);
});