import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { registerPayer } from "../registerPayer";

use(chaiJsonSchema);

describe("registerPayer", () => {
  const registerPayerResponseSchema = {
    type: "object",
    properties: {
      payerWalletAddress: { type: "string" },
      payerSecretKey: { type: "string" },
    },
    required: ["payerWalletAddress", "payerSecretKey"],
    additionalProperties: false,
  };

  it("should register a new payer", async () => {
    const payerInfo = await registerPayer();
    console.log("Registered a new payer wallet: ", payerInfo);

    expect(payerInfo).to.be.jsonSchema(registerPayerResponseSchema);
  }).timeout(30_000);
});
