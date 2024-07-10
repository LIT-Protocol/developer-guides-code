import { expect, use } from "chai";
import * as ethers from "ethers";
import chaiJsonSchema from "chai-json-schema";
import {
  GeneratePrivateKeyResult,
  EthereumLitTransaction,
} from "@lit-protocol/wrapped-keys";

import { getEnv, mintPkp } from "../src/utils";
import { generateWrappedKey } from "../src/generateWrappedKey";
import { signTransactionWithWrappedKey } from "../src/signTransactionWithWrappedKey";

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

describe("Signing an Ethereum transaction using generateWrappedKey and signTransactionWithEncryptedKey", () => {
  let ethersSigner: ethers.Wallet;
  let mintedPkp;
  let generateWrappedKeyResponse;

  before(async function () {
    this.timeout(120_000);
    ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    mintedPkp = await mintPkp(ethersSigner);

    generateWrappedKeyResponse = (await generateWrappedKey(
      mintedPkp!.publicKey,
      "evm"
    )) as GeneratePrivateKeyResult;

    console.log("🔄 Funding Wrapped Key's Ethereum address on Chronicle...");
    const wrappedKeyEthAddress = ethers.utils.computeAddress(
      generateWrappedKeyResponse.generatedPublicKey
    );
    const fundingAmount = "0.001";
    const txResponse = await ethersSigner.sendTransaction({
      to: wrappedKeyEthAddress,
      value: ethers.utils.parseUnits(fundingAmount, "ether"),
    });
    await txResponse.wait();
    console.log(
      `✅ Funded ${wrappedKeyEthAddress} with ${fundingAmount} ether`
    );

    console.log(`🔄 Checking Lit token balance for ${wrappedKeyEthAddress}...`);
    const balance = await ethersSigner.provider.getBalance(
      wrappedKeyEthAddress,
      "latest"
    );
    console.log(`✅ Got balance: ${ethers.utils.formatEther(balance)} ether`);
  });

  it("should sign and send an Ethereum transaction", async () => {
    const litTransaction: EthereumLitTransaction = {
      chainId: 175177,
      chain: "chronicleTestnet",
      toAddress: ethersSigner.address,
      value: "0.00000000001",
      gasLimit: 21_000,
    };

    const signedTransaction = await signTransactionWithWrappedKey(
      mintedPkp!.publicKey,
      "evm",
      litTransaction,
      true
    );

    expect(signedTransaction).to.match(RegExp("^0x[a-fA-F0-9]"));
  }).timeout(120_000);
});
