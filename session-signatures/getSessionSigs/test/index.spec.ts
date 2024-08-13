import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { executeTestAction } from "../src";

use(chaiJsonSchema);

describe("executionResponse", () => {
  const executeResponseSchema = {
    type: "object",
    properties: {
      signature: {
        type: "object",
        properties: {
          r: { 
            type: "string", 
            pattern: "^[a-f0-9]{64}$" 
          },
          s: { 
            type: "string", 
            pattern: "^[a-f0-9]{64}$" 
          },
          recid: { 
            type: "integer",
            enum: [0, 1] 
          },
          signature: { 
            type: "string", 
            pattern: "^0x[a-f0-9]{130}$" 
          },
          publicKey: { 
            type: "string", 
            pattern: "^[A-F0-9]{130}$" 
          },
          dataSigned: { 
            type: "string", 
            pattern: "^[A-F0-9]{64}$" 
          }
        },
        required: ["r", "s", "recid", "signature", "publicKey", "dataSigned"]
      }
    },
    required: ["signature"],
    additionalProperties: false
  };

  it("Attempting to execute Lit Action...", async () => {
    const executionResult = await executeTestAction();
    expect(executionResult).to.be.jsonSchema(executeResponseSchema);
  }).timeout(120_000);
});
