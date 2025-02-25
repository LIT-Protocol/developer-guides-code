import { expect } from "chai";

import { encryptString } from "../src";

describe("Encrypting and decrypting a string", () => {
  it("should encrypt and decrypt a string", async () => {
    const decryptedString = await encryptString();
    expect(decryptedString).to.equal(
      "The answer to life, the universe, and everything is 42."
    );
  }).timeout(120_000);
});
