import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

use(chaiJsonSchema);

import { createSafePKP } from "../src/index.js";

describe("createSafePKP", () => {
  it("should run the function successfully", async () => {
    const result = await createSafePKP();
    const expectedSchema = {
      type: "object",
      required: ["claims", "signatures", "response", "logs"],
      properties: {
        claims: { type: "object" },
        signatures: {
          type: "object",
          required: ["OpenAI"],
          properties: {
            OpenAI: {
              type: "object",
              required: ["r", "s", "recid", "signature", "publicKey", "dataSigned"],
              properties: {
                r: { type: "string" },
                s: { type: "string" },
                recid: { type: "number" },
                signature: { 
                  type: "string",
                  pattern: "^0x[a-fA-F0-9]+$"
                },
                publicKey: { type: "string" },
                dataSigned: { type: "string" }
              }
            }
          }
        },
        response: { type: "boolean" },
        logs: { type: "string" }
      }
    };

    expect(result).to.be.jsonSchema(expectedSchema);
  }).timeout(100_000);
});
