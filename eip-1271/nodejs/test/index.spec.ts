import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { runExample } from "../src";

use(chaiJsonSchema);

describe("Testing specific functionality", () => {
  it("should test for a specific thing", async () => {
    const sessionSignatures = await runExample();
    console.log(sessionSignatures);
  }).timeout(120_000);
});
