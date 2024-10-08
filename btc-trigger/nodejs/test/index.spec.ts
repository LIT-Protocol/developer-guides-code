import { expect } from "chai";
import { executeBtcSigning } from "../src/index";

describe("Running example", () => {
  before(async function () {
    this.timeout(120_000);
  });

  it("should successfully execute the Bitcoin transaction or indicate if the block height is even", async () => {
    const result = await executeBtcSigning();
    expect(result).to.be.a("string");

    if (result === "Block height was even; transaction not signed.") {
      console.log("Test passed: Block height was even.");
    } else {
      expect(result).to.match(/^[a-fA-F0-9]{64}$/);
      console.log("Test passed: Transaction broadcasted successfully. TXID:", result);
    }
  }).timeout(120_000);
});
