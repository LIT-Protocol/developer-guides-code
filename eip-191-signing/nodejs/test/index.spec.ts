import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

use(chaiJsonSchema);

import { signEIP191 } from "../src";

describe("signEIP191", () => {
  it("should sign the EIP-191 successfully", async () => {
    const result = await signEIP191();
    const expectedSchema = {
      type: "object",
      required: [
        "pubKey",
        "address",
      ],
      properties: {
        pubKey: { 
          type: "string",
          pattern: "^0x[a-fA-F0-9]{130}$",
        },
        address: { 
          type: "string",
          pattern: "^0x[a-fA-F0-9]{40}$",
        },
      },
    };
  
    expect(result).to.be.jsonSchema(expectedSchema);
  }).timeout(100_000);
});
