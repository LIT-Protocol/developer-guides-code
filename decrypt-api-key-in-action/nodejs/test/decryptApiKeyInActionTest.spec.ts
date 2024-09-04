import { expect } from "chai";
import { decryptApiKey } from "../src/index.js";
import { getEnv } from "../src/utils"

describe("decryptApiKey", () => {
  it("should decrypt API key successfully", async () => {
    const url = "https://base-mainnet.g.alchemy.com/v2/";
    const key = getEnv("ALCHEMY_API_KEY");
    const result = await decryptApiKey(url, key);

    expect(result).to.deep.include({
      success: true,
      signedData: {},
      decryptedData: {},
      claimData: {}
    });

    expect(result).to.have.property('response').that.is.a('string').and.matches(/{"jsonrpc":"2.0","id":1,"result":\d+}/);

    expect(result).to.have.property('logs').that.is.undefined;
  }).timeout(100_000);
});