import { expect } from "chai";
import { decryptApiKey } from "../src/index.js";

describe("decryptApiKey", () => {
  it("should decrypt API key successfully", async () => {
    const url = "https://base-mainnet.g.alchemy.com/v2/";
    const key = "HbaO4KM-hwt9C1MoCWkDn1WAiFyDDprn";
    const result = await decryptApiKey(url, key);

    expect(result).to.deep.include({
      success: true,
      decryptedData: {},
      claimData: {},
      response: `${key}`
    });

    expect(result).to.have.property('logs').that.is.undefined;
  }).timeout(100_000);
});