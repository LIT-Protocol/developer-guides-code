import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { runExample } from "../src";

use(chaiJsonSchema);

describe("Sending a Wrapped Key EVM Tx", () => {
  it("should send a transaction and return a transaction hash", async () => {
    const transactionHash = await runExample();
    expect(transactionHash).to.match(RegExp("^0x[a-fA-F0-9]"));
  }).timeout(120_000);
});
