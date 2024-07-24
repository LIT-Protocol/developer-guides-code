import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { getEnv } from "../src/utils";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Testing specific functionality", () => {
  before(async function () {
    this.timeout(120_000);
  });

  it("should test for a specific thing", async () => {
    const exampleResponseSchema = {
      type: "object",
      required: ["these", "are", "requiredProperties"],
      properties: {
        these: {
          type: "string",
        },
        are: {
          type: "string",
          pattern: "^[a-fA-F0-9]{64}$",
        },
        requiredProperties: {
          type: "string",
          enum: ["foobar"],
        },
      },
    };

    expect({ foo: "bar" }).to.be.jsonSchema(exampleResponseSchema);
  }).timeout(120_000);
});
