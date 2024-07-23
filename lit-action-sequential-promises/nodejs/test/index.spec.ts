import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

import { getEnv } from "../src/utils";
import { runExample } from "../src";

use(chaiJsonSchema);

const PKP_PUBLIC_KEY = getEnv("PKP_PUBLIC_KEY");

describe("Testing specific functionality", () => {
  it("should test for a specific thing", async () => {
    await runExample(PKP_PUBLIC_KEY);
  }).timeout(120_000);
});
