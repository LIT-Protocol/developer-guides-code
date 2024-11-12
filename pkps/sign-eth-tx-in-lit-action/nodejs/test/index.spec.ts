import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { getEnv } from "../src/utils";
import { runExample } from "../src";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Testing specific functionality", () => {
  it("should test for a specific thing", async () => {
    await runExample();
  }).timeout(120_000);
});
