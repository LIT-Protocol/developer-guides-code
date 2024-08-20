import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { signAndCombineAndSendTx } from "../src";

use(chaiJsonSchema);

describe("signAndCombineAndSendTx", () => {
  const signedTxResponseSchema = {
    type: "object",
    properties: {
      success: { type: "boolean" },
      signedData: { type: "object" },
      decryptedData: { type: "object" },
      claimData: { type: "object" },
      response: { type: "string" },
      logs: { type: "string" },
    },
    required: [
      "success",
      "signedData",
      "decryptedData",
      "claimData",
      "response",
      "logs",
    ],
    additionalProperties: false,
  };
  it("Attempting to sign, combine, and send transaction...", async () => {
    const signedTx = await signAndCombineAndSendTx();
    expect(signedTx).to.be.jsonSchema(signedTxResponseSchema);
  }).timeout(30_000);
});
