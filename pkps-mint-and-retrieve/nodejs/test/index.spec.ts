import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { getEnv } from "../src/utils";
import { runTheExample } from "../src";

use(chaiJsonSchema);

describe("Testing specific functionality", () => {
  it("should test for a specific thing", async () => {
    await runTheExample();
  }).timeout(120_000);
});
