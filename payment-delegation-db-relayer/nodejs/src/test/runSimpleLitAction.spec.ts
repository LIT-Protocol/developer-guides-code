import { expect } from "chai";
import ethers from "ethers";

import { registerPayer } from "../registerPayer";
import { addUsers } from "../addUsers";
import { runSimpleLitAction } from "../runSimpleLitAction";

describe("Run simple Lit Action to test user delegation", () => {
  const newEthersSigner = ethers.Wallet.createRandom();

  let newPayerInfo;

  before(async function () {
    this.timeout(60_000);

    newPayerInfo = await registerPayer();
    await addUsers([newEthersSigner.address]);
  });

  it("should run the Lit Action with a new user added as a delegatee", async () => {
    const result = await runSimpleLitAction(newEthersSigner);
    expect(result).to.eq("The answer to the universe is 42.\n");
  }).timeout(60_000);
});
