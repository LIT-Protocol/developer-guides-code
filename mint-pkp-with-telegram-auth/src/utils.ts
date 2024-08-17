import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNetwork } from "@lit-protocol/constants";

export const mintCapacityCredit = async (
  ethersSigner: ethers.providers.JsonRpcSigner
) => {
  try {
    console.log("🔄 Connecting LitContracts client to the network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.Habanero,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to the network");

    console.log("🔄 Minting new Capacity Credit...");
    const capacityTokenId = (
      await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 30,
      })
    ).capacityTokenIdStr;
    console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    return capacityTokenId;
  } catch (error) {
    console.error(error);
  }
};
