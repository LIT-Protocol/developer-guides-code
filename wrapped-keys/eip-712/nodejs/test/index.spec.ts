import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import { ethers } from "ethers";
import { runExample } from "../src";

use(chaiJsonSchema);

describe("Signing an EIP-712 message using a Wrapped Key", () => {
  it("should return signed EIP-712 message", async () => {
    console.log("🔄 Generating EIP-712 message...");
    // Define the domain
    const domain = {
      name: "Ether Mail",
      version: "1",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    };

    // Define the types
    const types = {
      Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" },
      ],
    };

    // Define the value
    const value = {
      from: {
        name: "Alice",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      contents: "Hello, Bob!",
    };

    const serializedEip712Message = JSON.stringify(
      ethers.utils._TypedDataEncoder.getPayload(domain, types, value)
    );
    console.log(
      `✅ Generated and serialized EIP-712 message: ${serializedEip712Message}`
    );

    const { signedMessage, wrappedKeyEthAddress } = (await runExample(
      serializedEip712Message
    )) ?? { signedMessage: "", wrappedKeyEthAddress: "" };

    expect(signedMessage).to.not.equal("");
    expect(wrappedKeyEthAddress).to.not.equal("");

    const recoveredAddress = ethers.utils.verifyTypedData(
      domain,
      types,
      value,
      signedMessage
    );
    expect(recoveredAddress).to.equal(wrappedKeyEthAddress);
  }).timeout(120_000);
});
