import { LitContracts } from "@lit-protocol/contracts-sdk";

export const mintCapacityCredit = async (
  litContracts: LitContracts,
  options?: {
    requestsPerDay?: number;
    requestsPerSecond?: number;
    requestsPerKilosecond?: number;
    daysUntilUTCMidnightExpiration?: number;
  }
) => {
  console.log("🔄 Minting Capacity Credits NFT...");
  const capacityTokenId = (
    await litContracts.mintCapacityCreditsNFT({
      requestsPerKilosecond: 10,
      daysUntilUTCMidnightExpiration: 1,
      ...options,
    })
  ).capacityTokenIdStr;
  console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
  return capacityTokenId;
};
