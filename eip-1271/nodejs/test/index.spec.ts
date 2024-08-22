import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { runExample } from "../src";

use(chaiJsonSchema);

describe("Testing specific functionality", () => {
  it("should test for a specific thing", async () => {
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

    const sessionSignatures = await runExample();
    expect(sessionSignatures).to.be.jsonSchema(expectedSessionSigsSchema);
  }).timeout(120_000);
});
