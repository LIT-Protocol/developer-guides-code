import * as ethers from "ethers";
import { LIT_NETWORK, LIT_RPC } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const mintCapacityCredit = async () => {
  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting to Lit network...");
    const litContractClient = new LitContracts({
      signer: ethersSigner,
      network: LIT_NETWORK.DatilTest,
    });
    await litContractClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Minting Capacity Credit NFT via contract...");
    const capacityCreditInfo = await litContractClient.mintCapacityCreditsNFT({
      requestsPerKilosecond: 80,
      // requestsPerDay: 14400,
      // requestsPerSecond: 10,
      daysUntilUTCMidnightExpiration: 1,
    });
    console.log(
      `✅ Minted Capacity Credit with ID: ${capacityCreditInfo.capacityTokenIdStr}. Tx hash: ${capacityCreditInfo.rliTxHash}`
    );

    return capacityCreditInfo;
  } catch (error) {
    console.error(error);
  }
};
