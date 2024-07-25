import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import { getSessionSigsLitAction } from "../src";

use(chaiJsonSchema);

describe("getSessionSigsLitAction", () => {
  const sessionSigResponseSchema = {
    type: "object",
    patternProperties: {
      "^https://\\d+\\.\\d+\\.\\d+\\.\\d+:\\d+$": {
        type: "object",
        properties: {
          sig: { type: "string" },
          derivedVia: { type: "string" },
          signedMessage: { type: "string" },
          address: { type: "string" },
          algo: { type: "string" },
        },
        required: ["sig", "derivedVia", "signedMessage", "address", "algo"],
      },
    },
    additionalProperties: false,
  };

  it("Attempting to get session signatures...", async () => {
    const sessionSignatures = await getSessionSigsLitAction();
    expect(sessionSignatures).to.be.jsonSchema(sessionSigResponseSchema);
  }).timeout(120_000);
});
