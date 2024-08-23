import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

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

  const conditionalSigningResponseSchemaNotFunded = {
    type: "object",
    properties: {
      success: { type: "boolean" },
      signedData: { type: "object" },
      decryptedData: { type: "object" },
      claimData: { type: "object" },
      response: {
        type: "string",
        pattern: "^address does not have 1 or more Wei on Ethereum Mainnet$",
      },
    },
    required: [
      "success",
      "signedData",
      "decryptedData",
      "claimData",
      "response",
    ],
  };

  it("Attempting to perform conditional signing...", async () => {
    const signedTx = await conditionalSigning();
    expect(signedTx).to.be.jsonSchema({
      anyOf: [
        conditionalSigningResponseSchemaFunded,
        conditionalSigningResponseSchemaNotFunded,
      ],
    });
  }).timeout(100_000);
});
