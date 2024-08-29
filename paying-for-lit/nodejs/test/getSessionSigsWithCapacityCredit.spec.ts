import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import { MintCapacityCreditsRes, SessionSigsMap } from "@lit-protocol/types";
import ethers from "ethers";
import { AuthSig } from "@lit-protocol/auth-helpers";
import { LitNetwork } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

import { delegateCapacityCredit } from "../src/delegateCapacityCredit";
import { mintCapacityCredit } from "../src/mintCapacityCredit";
import { getEnv } from "../src/utils";
import { getSessionSigsWithCapacityCreditAuthSig } from "../src/getSessionSigsWithCapacityCreditAuthSig";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Testing getting Session Signatures using delegation Auth Signature", () => {
  let delegatorEthersSigner: ethers.Wallet;
  let delegateeEthersSigner: ethers.Wallet;
  let mintedCapacityCredit: MintCapacityCreditsRes;
  let delegationAuthSig: AuthSig;
  let sessionSigs: SessionSigsMap;

  before(async function () {
    this.timeout(120_000);
    delegatorEthersSigner = new ethers.Wallet(ETHEREUM_PRIVATE_KEY);
    delegateeEthersSigner = ethers.Wallet.createRandom();

    mintedCapacityCredit =
      (await mintCapacityCredit()) as MintCapacityCreditsRes;

    delegationAuthSig = (await delegateCapacityCredit(
      mintedCapacityCredit.capacityTokenIdStr,
      delegateeEthersSigner.address
    )) as AuthSig;
  });

  it("should get Session Signatures", async () => {
    const expectedSessionSigsSchema = {
      type: "object",
      patternProperties: {
        "^https://[0-9.]+:[0-9]+$": {
          type: "object",
          required: ["sig", "derivedVia", "signedMessage", "address", "algo"],
          properties: {
            sig: {
              type: "string",
              pattern: "^[a-f0-9]{128}$",
            },
            derivedVia: {
              type: "string",
              enum: ["litSessionSignViaNacl"],
            },
            signedMessage: {
              type: "string",
              pattern: "^\\{.*\\}$",
            },
            address: {
              type: "string",
              pattern: "^[a-f0-9]{64}$",
            },
            algo: {
              type: "string",
              enum: ["ed25519"],
            },
          },
        },
      },
      additionalProperties: false,
    };

    sessionSigs = (await getSessionSigsWithCapacityCreditAuthSig(
      delegationAuthSig,
      delegateeEthersSigner
    )) as SessionSigsMap;
    expect(sessionSigs).to.be.jsonSchema(expectedSessionSigsSchema);
  }).timeout(120_000);

  it("should successfully use generated Session Signatures to execute Lit Action code", async () => {
    let litNodeClient: LitNodeClient;

    try {
      console.log("🔄 Connecting to Lit network...");
      litNodeClient = new LitNodeClient({
        litNetwork: LitNetwork.DatilDev,
        debug: false,
      });
      await litNodeClient.connect();
      console.log("✅ Connected to Lit network");

      const response = await litNodeClient.executeJs({
        sessionSigs,
        code: `(() => console.log("It works!"))();`,
      });
      expect(response.logs).to.eq("It works!\n");
    } finally {
      litNodeClient!.disconnect();
    }
  }).timeout(120_000);
});
