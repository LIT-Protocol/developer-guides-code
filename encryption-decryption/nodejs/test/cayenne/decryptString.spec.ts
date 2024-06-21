import { expect, use } from "chai";
import * as ethers from "ethers";

import { getEnv } from "../../src/utils";
import { encryptString } from "../../src/cayenne/encryptString";
import { decryptString } from "../../src/cayenne/decryptString";

use(require("chai-json-schema"));

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Decrypting a string with a specific address authorized for decryption", () => {
  const STRING_TO_ENCRYPT = "The answer to the universe is 42";

  let ethersSigner: ethers.Wallet;
  let encryptionMetadata: { ciphertext: string; dataToEncryptHash: string };

  before(async function () {
    this.timeout(30_000);
    ethersSigner = new ethers.Wallet(ETHEREUM_PRIVATE_KEY);

    encryptionMetadata = (await encryptString(
      STRING_TO_ENCRYPT,
      ethersSigner.address
    )) as { ciphertext: string; dataToEncryptHash: string };
  });

  it("should decrypt provided encryption metadata", async () => {
    const decryptiongResult = await decryptString(
      encryptionMetadata.ciphertext,
      encryptionMetadata.dataToEncryptHash,
      [
        {
          contractAddress: "",
          standardContractType: "",
          chain: "ethereum",
          method: "",
          parameters: [":userAddress"],
          returnValueTest: {
            comparator: "=",
            value: ethersSigner.address,
          },
        },
      ]
    );

    expect(decryptiongResult).to.equal(STRING_TO_ENCRYPT);
  }).timeout(30_000);
});
