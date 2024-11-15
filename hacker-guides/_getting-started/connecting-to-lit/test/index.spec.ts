import { runExample } from "../src";

describe("Testing connecting to a Lit Network", () => {
  it("should connect to a Lit Network", async () => {
    await runExample();
  }).timeout(120_000);
});
