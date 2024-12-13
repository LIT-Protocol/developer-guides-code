import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { getEnv } from "../src/utils";
import { runExample } from "../src";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Testing specific functionality", () => {

  it("should test for a specific thing", async () => {
    const responseSchema = {
      type: "object",
      properties: {
        claims: {
          type: "object",
        },
        signatures: {
          type: "object",
          properties: {
            sig: {
              type: "object",
              properties: {
                r: { type: "string", pattern: "^[a-f0-9]{64}$" },
                s: { type: "string", pattern: "^[a-f0-9]{64}$" },
                recid: { type: "integer" },
                signature: { type: "string", pattern: "^0x[a-f0-9]{130}$" },
                publicKey: { type: "string", pattern: "^04[A-F0-9]{128}$" },
                dataSigned: { type: "string", pattern: "^[A-F0-9]{64}$" },
              },
              required: [
                "r",
                "s",
                "recid",
                "signature",
                "publicKey",
                "dataSigned",
              ],
            },
          },
          required: ["sig"],
        },
        response: { type: "string" },
        logs: { type: "string" },
      },
      required: ["claims", "signatures", "response", "logs"],
    };

    const result = await runExample();
    expect(result).to.be.jsonSchema(responseSchema);
  }).timeout(120_000);
});
