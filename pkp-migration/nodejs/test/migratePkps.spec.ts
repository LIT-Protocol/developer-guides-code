import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { AuthMethodScope } from "@lit-protocol/constants";
import { LIT_NETWORKS_KEYS } from "@lit-protocol/types";
import { existsSync, readFileSync, unlinkSync } from "fs";

import { getEnv, mintPkp } from "../src/utils";
import { migratePkps } from "../src/migratePkps";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const LIT_FROM_NETWORK = getEnv("LIT_FROM_NETWORK");
const LIT_TO_NETWORK = getEnv("LIT_TO_NETWORK");
const FAKE_IPFS_CID = "QmXVnmieUfTaDZC5aPH9MdPtY7atUgx8vkg3mniDr7ycQm";
const FAKE_IPFS_CID_2 = "QmXVnmieUfTaDZC5aPH9MdPtY7atUgx4vkg3mniDr7ycQm";

interface MintedPkp {
  tokenId: any;
  publicKey: string;
  ethAddress: string;
}

interface ExistingPkps {
  [pkp: string]: MintedPkp;
}

describe(`Migrating PKPs from ${LIT_FROM_NETWORK} to ${LIT_TO_NETWORK}`, () => {
  const NEW_PKPS_FILE_PATH = "./newPkps_test.json";
  const NEW_PKPS_FILE_JSON_SCHEMA = {
    type: "object",
    patternProperties: {
      "^[0-9a-fA-F]{128}$": {
        type: "object",
        properties: {
          newPkp: {
            type: "string",
            pattern: "^0x[0-9a-fA-F]{130}$",
          },
          txHash: {
            type: "string",
            pattern: "^0x[0-9a-fA-F]{64}$",
          },
          newPkpTokenId: {
            type: "string",
            pattern: "^0x[0-9a-fA-F]{64}$",
          },
          newPkpEthAddress: {
            type: "string",
            pattern: "^0x[0-9a-fA-F]{40}$",
          },
          oldPkpEthAddress: {
            type: "string",
            pattern: "^0x[0-9a-fA-F]{40}$",
          },
          oldPkpTokenId: {
            type: "string",
            pattern: "^0x[0-9a-fA-F]{64}$",
          },
        },
        required: [
          "newPkp",
          "txHash",
          "newPkpTokenId",
          "newPkpEthAddress",
          "oldPkpEthAddress",
          "oldPkpTokenId",
        ],
      },
    },
  };
  const existingPkps: ExistingPkps = {};

  let ethersSigner: ethers.Wallet;
  let mintedPkpWithAuthMethods: MintedPkp;
  let mintedPkpWithAuthMethods2: MintedPkp;
  let mintedPkpWithoutAuthMethods: MintedPkp;
  let pkpsToMigrate: string[];

  before(async function () {
    if (existsSync(NEW_PKPS_FILE_PATH)) {
      console.log(
        `❗️ Removing existing new PKPs metadata file: ${NEW_PKPS_FILE_PATH}...`
      );
      unlinkSync(NEW_PKPS_FILE_PATH);
      console.log(`✅ Removed existing new PKPs metadata file`);
    }

    this.timeout(120_000);
    ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    mintedPkpWithAuthMethods = (await mintPkp(ethersSigner)) as MintedPkp;
    mintedPkpWithAuthMethods2 = (await mintPkp(ethersSigner)) as MintedPkp;
    mintedPkpWithoutAuthMethods = (await mintPkp(ethersSigner)) as MintedPkp;

    const litContractsClientFromNetwork = new LitContracts({
      signer: ethersSigner,
      network: LIT_FROM_NETWORK as LIT_NETWORKS_KEYS,
    });
    await litContractsClientFromNetwork.connect();

    await litContractsClientFromNetwork.addPermittedAction({
      pkpTokenId: mintedPkpWithAuthMethods.tokenId,
      ipfsId: FAKE_IPFS_CID,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });

    await litContractsClientFromNetwork.addPermittedAction({
      pkpTokenId: mintedPkpWithAuthMethods2.tokenId,
      ipfsId: FAKE_IPFS_CID_2,
      authMethodScopes: [AuthMethodScope.PersonalSign],
    });

    existingPkps[mintedPkpWithAuthMethods!.publicKey] =
      mintedPkpWithAuthMethods;
    existingPkps[mintedPkpWithAuthMethods2!.publicKey] =
      mintedPkpWithAuthMethods2;
    existingPkps[mintedPkpWithoutAuthMethods!.publicKey] =
      mintedPkpWithoutAuthMethods;

    pkpsToMigrate = [
      mintedPkpWithAuthMethods!.publicKey,
      mintedPkpWithAuthMethods2!.publicKey,
      mintedPkpWithoutAuthMethods!.publicKey,
    ];
  });

  it(`should migrate 3 PKPs from ${LIT_FROM_NETWORK} to ${LIT_TO_NETWORK}`, async () => {
    await migratePkps(pkpsToMigrate, NEW_PKPS_FILE_PATH);

    const newPkps = JSON.parse(readFileSync(NEW_PKPS_FILE_PATH).toString());

    expect(newPkps).to.be.jsonSchema(NEW_PKPS_FILE_JSON_SCHEMA);

    for (const existingPkp of pkpsToMigrate) {
      console.log(`🔄 Validating migration of: ${existingPkp}...`);

      expect(newPkps.hasOwnProperty(existingPkp)).true;
      const newPkp = newPkps[existingPkp];
      expect(newPkp.oldPkpEthAddress).to.eql(
        existingPkps[existingPkp].ethAddress
      );
      expect(newPkp.oldPkpTokenId).to.eql(existingPkps[existingPkp].tokenId);

      console.log(`✅ Validated migration`);
    }
  }).timeout(60_000);
});
