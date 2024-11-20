import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

use(chaiJsonSchema);

import { fetchLitAction } from "../src";

describe("fetchLitAction", () => {
  it("should successfully execute the Lit Action", async () => {
    const responseSchema = {
      type: "object",
      oneOf: [
        {
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
        },
        {
          properties: {
            success: { type: "boolean" },
            signedData: { type: "object" },
            decryptedData: { type: "object" },
            claimData: { type: "object" },
            response: { type: "string", pattern: "^It's too cold to sign the message!$" },
            logs: { type: "string", pattern: "^Current temperature from the API: \\d+\\n$"},
          },
          required: ["success", "signedData", "decryptedData", "claimData", "response", "logs"],
        }
      ]
    };

    const result = await fetchLitAction();
    expect(result).to.be.jsonSchema(responseSchema);
  }).timeout(120_000);
});