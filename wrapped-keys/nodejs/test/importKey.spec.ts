import { expect } from "chai";
import { importKey } from "../src/importKey";
// import chaiJsonSchema from "chai-json-schema";

// use(chaiJsonSchema);

describe("importKey", () => {
  it("should do something", async () => {
    const foo = await importKey();
  }).timeout(30_000);
});
