import { expect, use } from "chai";
import * as ethers from "ethers";

import { getEnv } from "../../src/utils";
import { encryptString } from "../../src/habanero/encryptString";

use(require("chai-json-schema"));

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Encrypting a string with a specific address authorized for decryption", () => {
  let ethersSigner;

  before(async function () {
    ethersSigner = new ethers.Wallet(ETHEREUM_PRIVATE_KEY);
  });

  it("should encrypt a provided string", async () => {
    const encryptionResponseSchema = {
      title: "Response Schema",
      type: "object",
      required: ["ciphertext", "dataToEncryptHash"],
      properties: {
        ciphertext: {
          type: "string",
          pattern: "^[A-Za-z0-9+/=]+$",
        },
        dataToEncryptHash: {
          type: "string",
          pattern: "^[a-f0-9]{64}$",
        },
      },
    };

    const stringToEncrypt = "The answer to the universe is 42";
    const encryptionResult = await encryptString(
      stringToEncrypt,
      ethersSigner!.address
    );

    expect(encryptionResult).to.be.jsonSchema(encryptionResponseSchema);
  }).timeout(30_000);
});
