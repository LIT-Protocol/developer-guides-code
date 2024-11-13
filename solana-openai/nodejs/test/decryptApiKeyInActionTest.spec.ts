import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

use(chaiJsonSchema);

import { solanaOpenAI } from "../src/index.js";

describe("decryptApiKey", () => {
  it("should run the function successfully", async () => {
    const result = await solanaOpenAI();
    const expectedSchema = {
      type: "object",
      required: [
        "success",
        "signedData",
        "decryptedData",
        "claimData",
        "response",
      ],
      properties: {
        success: { type: "boolean" },
        signedData: { type: "object" },
        decryptedData: { type: "object" },
        claimData: { type: "object" },
        response: {
          type: "string",
          pattern: "Signed message. Is signature valid: true$",
        },
        logs: { type: "string" },
      },
    };

    expect(result).to.be.jsonSchema(expectedSchema);
  }).timeout(100_000);
});
