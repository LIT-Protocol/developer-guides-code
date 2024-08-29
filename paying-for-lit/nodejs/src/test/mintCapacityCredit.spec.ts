import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { getEnv } from "../utils";
import { mintCapacityCredit } from "../mintCapacityCredit";

use(chaiJsonSchema);

describe("Testing minting a Capacity Credit", () => {
  before(async function () {
    this.timeout(120_000);
  });

  it("should mint a new capacity credit", async () => {
    const expectedCapacityCreditInfoSchema = {
      type: "object",
      required: ["rliTxHash", "capacityTokenId", "capacityTokenIdStr"],
      properties: {
        rliTxHash: {
          type: "string",
          pattern: "^0x[a-fA-F0-9]{64}$",
        },
        capacityTokenId: {
          type: "object",
          properties: {
            hex: {
              type: "string",
              pattern: "^0x[a-fA-F0-9]+$",
            },
            isBigNumber: {
              type: "boolean",
              enum: [true],
            },
          },
        },
        capacityTokenIdStr: {
          type: "string",
          pattern: "^[0-9]+$",
        },
      },
    };

    const capacityCreditInfo = await mintCapacityCredit();
    expect(capacityCreditInfo).to.be.jsonSchema(
      expectedCapacityCreditInfoSchema
    );
  }).timeout(120_000);
});
