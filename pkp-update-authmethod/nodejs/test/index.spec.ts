import { expect } from "chai";

import { runTheExample } from "../src";

describe("Run the example", () => {
  it("should return true if the example ran without error", async () => {
    const success = await runTheExample();
    expect(success).to.be.true;
  }).timeout(60_000);
});
