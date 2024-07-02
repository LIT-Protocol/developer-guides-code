import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import * as ethers from "ethers";

import { getEnv, mintPkp } from "../src/utils";
import { getWrappedKeyMetadata } from "../src/getWrappedKeyMetadata";
import { importKey } from "../src/importKey";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const NEW_ETHEREUM_KEYPAIR_WALLET = ethers.Wallet.createRandom();

describe("Getting Wrapped Key metadata using getEncryptedKeyMetadata", () => {
  let mintedPkp;

  before(async function () {
    this.timeout(120_000);
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    mintedPkp = await mintPkp(ethersSigner);

    const pkpAddressKeyWasAttachedTo = await importKey(
      mintedPkp!.publicKey,
      NEW_ETHEREUM_KEYPAIR_WALLET.privateKey,
      NEW_ETHEREUM_KEYPAIR_WALLET.publicKey,
      "K256"
    );

    expect(pkpAddressKeyWasAttachedTo).to.equal(mintedPkp!.ethAddress);
  });

  it("should get the metadata for a Wrapped Key associated with a PKP", async () => {
    const wrappedKeyMetadataResponseSchema = {
      type: "object",
      required: [
        "ciphertext",
        "dataToEncryptHash",
        "keyType",
        "pkpAddress",
        "publicKey",
        "litNetwork",
      ],
      properties: {
        ciphertext: {
          type: "string",
        },
        dataToEncryptHash: {
          type: "string",
          pattern: "^[a-fA-F0-9]{64}$",
        },
        keyType: {
          type: "string",
          enum: ["K256"],
        },
        pkpAddress: {
          type: "string",
          pattern: "^0x[a-fA-F0-9]{40}$",
        },
        publicKey: {
          type: "string",
          pattern: "^0x[a-fA-F0-9]+$",
        },
        litNetwork: {
          type: "string",
          enum: ["cayenne"],
        },
      },
    };

    const wrappedKeyMetadata = await getWrappedKeyMetadata(
      mintedPkp!.publicKey
    );

    expect(wrappedKeyMetadata).to.be.jsonSchema(
      wrappedKeyMetadataResponseSchema
    );
  }).timeout(120_000);
});
