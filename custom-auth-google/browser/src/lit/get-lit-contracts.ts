import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LIT_NETWORK } from "@lit-protocol/constants";
import type { ethers } from "ethers";

export const getLitContracts = async (ethersSigner: ethers.Signer) => {
  console.log("🔄 Connecting LitContracts client to network...");
  const litContracts = new LitContracts({
    signer: ethersSigner,
    network: LIT_NETWORK.DatilTest,
  });
  await litContracts.connect();
  console.log("✅ Connected LitContracts client to network");

  return litContracts;
};
