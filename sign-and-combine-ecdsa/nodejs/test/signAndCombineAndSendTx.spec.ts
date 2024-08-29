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
      response: {
        type: "string",
        pattern:
          "^Transaction Sent Successfully\\. Transaction Hash: 0x[0-9a-fA-F]{64}$",
      },
      logs: {
        type: "string",
        pattern: "^Recovered Address: 0x[0-9a-fA-F]{40}\\n$",
      },
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
  }).timeout(100_000);
});
