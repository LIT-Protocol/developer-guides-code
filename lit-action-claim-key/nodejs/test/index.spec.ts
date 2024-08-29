import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { runExample } from "../src";

use(chaiJsonSchema);

describe("Testing specific functionality", () => {
  it("should test for a specific thing", async () => {
    const pkpInfoSchema = {
      title: "Token Object Schema",
      type: "object",
      required: ["tokenId", "publicKey", "ethAddress"],
      properties: {
        tokenId: {
          type: "string",
          pattern: "^[0-9]+$",
        },
        publicKey: {
          type: "string",
          pattern: "^0x[a-fA-F0-9]{130}$",
        },
        ethAddress: {
          type: "string",
          pattern: "^0x[a-fA-F0-9]{40}$",
        },
      },
      additionalProperties: false,
    };

    const pkpInfo = await runExample();
    expect(pkpInfo).to.be.jsonSchema(pkpInfoSchema);
  }).timeout(120_000);
});
