import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { getSessionSigsViaAuthSig } from "../src";

use(chaiJsonSchema);

describe("getSessionSigsViaAuthSig", () => {
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

  it("should get the session signatures", async () => {
    const sessionSignatures = await getSessionSigsViaAuthSig();
    expect(sessionSignatures).to.be.jsonSchema(sessionSigResponseSchema);
  }).timeout(30_000);
});
