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
      response: { type: "string", pattern: `^\\{"to":"0x[0-9a-fA-F]{40}","from":"0x[0-9a-fA-F]{40}","contractAddress":(null|"0x[0-9a-fA-F]{40}"),"transactionIndex":\\d+,"gasUsed":\\{"type":"BigNumber","hex":"0x[0-9a-fA-F]+"\\},"logsBloom":"0x[0-9a-fA-F]+","blockHash":"0x[0-9a-fA-F]+","transactionHash":"0x[0-9a-fA-F]+","logs":\\[\\],"blockNumber":\\d+,"confirmations":\\d+,"cumulativeGasUsed":\\{"type":"BigNumber","hex":"0x[0-9a-fA-F]+"\\},"effectiveGasPrice":\\{"type":"BigNumber","hex":"0x[0-9a-fA-F]+"\\},"status":\\d+,"type":\\d+,"byzantium":true\\}$`},
      logs: { type: "string", pattern: "^Recovered Address: 0x[0-9a-fA-F]{40}\\n$" },
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
