import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import * as ethers from "ethers";
import { LIT_RPC } from "@lit-protocol/constants";
import {
  GeneratePrivateKeyResult,
  ImportPrivateKeyResult,
} from "@lit-protocol/wrapped-keys";
import { Keypair } from "@solana/web3.js";

import { getEnv, mintPkp } from "../src/utils";
import { importKey } from "../src/importKey";
import { generateWrappedKey } from "../src/generateWrappedKey";
import { listWrappedKeys } from "../src/listWrappedKeys";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const NEW_ETHEREUM_KEYPAIR_WALLET = ethers.Wallet.createRandom();

describe("Wrapped Keys for a PKP using listEncryptedKeyMetadata", () => {
  let ethersSigner: ethers.Wallet;
  let solanaKeypair: Keypair;
  let mintedPkp;
  let generateWrappedKeyResponse: GeneratePrivateKeyResult;
  let generateWrappedKeyResponse2: GeneratePrivateKeyResult;
  let importedKeyResponse: ImportPrivateKeyResult;

  before(async function () {
    this.timeout(120_000);
    ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    solanaKeypair = Keypair.generate();

    mintedPkp = await mintPkp(ethersSigner);

    generateWrappedKeyResponse = (await generateWrappedKey(
      mintedPkp!.publicKey,
      "evm",
      "This is a Dev Guide code example testing Ethereum key"
    )) as GeneratePrivateKeyResult;

    generateWrappedKeyResponse2 = (await generateWrappedKey(
      mintedPkp!.publicKey,
      "solana",
      "This is a Dev Guide code example testing Solana key"
    )) as GeneratePrivateKeyResult;

    importedKeyResponse = (await importKey(
      mintedPkp!.publicKey,
      Buffer.from(solanaKeypair.secretKey).toString("hex"),
      solanaKeypair.publicKey.toString(),
      "ed25519",
      "This is a Dev Guide code example testing Solana key"
    )) as ImportPrivateKeyResult;
  });

  it("should list the Wrapped Keys attached to the PKP", async () => {
    const listWrappedKeysResponseSchema = {
      type: "array",
      items: {
        type: "object",
        required: ["pkpAddress", "id", "publicKey", "litNetwork", "keyType"],
        properties: {
          pkpAddress: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]{40}$",
          },
          id: {
            type: "string",
            pattern:
              "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
          },
          publicKey: {
            type: "string",
          },
          litNetwork: {
            type: "string",
          },
          keyType: {
            type: "string",
            enum: ["K256", "ed25519"],
          },
        },
        additionalProperties: false,
      },
    };

    const result = await listWrappedKeys(mintedPkp!.publicKey);
    expect(result).to.be.jsonSchema(listWrappedKeysResponseSchema);
    expect(result!.length).to.eq(3);
  }).timeout(120_000);
});
