import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

use(chaiJsonSchema);

import { decryptApiKey } from "../src/index.js";
import { getEnv } from "../src/utils";

const ALCHEMY_API_KEY = getEnv("ALCHEMY_API_KEY");

describe("decryptApiKey", () => {
  it("should decrypt API key successfully", async () => {
    const url = "https://base-mainnet.g.alchemy.com/v2/";
    const result = await decryptApiKey(url, ALCHEMY_API_KEY);
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
          pattern: "^[0-9]+$",
        },
        logs: { type: ["undefined", "array"] },
      },
    };

    expect(result).to.be.jsonSchema(expectedSchema);
  }).timeout(100_000);
});
