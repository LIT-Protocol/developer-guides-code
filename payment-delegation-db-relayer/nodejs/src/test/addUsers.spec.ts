import { expect } from "chai";

import { addUsers } from "../addUsers";

describe("addUsers", () => {
  const users = [
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "0x6c6ee5e31d828de241282b9606c8e98ea48526e2",
    "0x53d284357ec70ce289d6d64134dfac8e511c8a3d",
  ];

  it("should add users as delegatees", async () => {
    const result = await addUsers(users);
    expect(result).to.be.true;
  }).timeout(30_000);
});
