import { expect } from "chai";

import { signAndCombineAndSendTx } from "../src";

describe("signAndCombineAndSendTx", () => {
  it("should", async () => {
    await signAndCombineAndSendTx();
  }).timeout(60_000);
});
