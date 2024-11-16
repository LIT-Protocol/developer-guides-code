import { expect } from "chai";
import { promises as fs } from "fs";
import { join } from "path";

import { runExample } from "../src";

describe("Encrypting and decrypting a file", () => {
  afterEach(async () => {
    // Clean up the decrypted file after test
    try {
      const decryptedPath = join(
        process.cwd(),
        "src",
        "loremIpsum-decrypted.txt"
      );
      await fs.unlink(decryptedPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  it("should encrypt and decrypt a file", async () => {
    // Get the original file content
    const originalPath = join(process.cwd(), "src", "loremIpsum.txt");
    const originalContent = await fs.readFile(originalPath, "utf8");

    await runExample();

    const decryptedPath = join(
      process.cwd(),
      "src",
      "loremIpsum-decrypted.txt"
    );
    const decryptedContent = await fs.readFile(decryptedPath, "utf8");

    expect(decryptedContent).to.equal(originalContent);
  }).timeout(120_000);
});
