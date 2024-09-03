import { expect } from "chai";
import { checkAccessControl } from "../src/index.js";

describe("decryptApiKey", () => {
  it("should decrypt API key successfully", async () => {
    const url = "https://api.example.com/api-key";
    const key = "won27213IWD289q2hWDUwDh10d";
    const result = await checkAccessControl();
    
    expect(result).to.deep.include({
      success: true,
      decryptedData: {},
      claimData: {},
      response: `${key}`
    });
    
    expect(result).to.have.property('logs').that.is.undefined;
  }).timeout(100_000);
});