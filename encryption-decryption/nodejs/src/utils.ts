import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNetwork } from "@lit-protocol/constants";

export const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

export const mintCapacityCredit = async (ethersSigner: ethers.Wallet) => {
  try {
    console.log("Connecting LitContracts client to the network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.DatilTest,
    });
    console.log("Connected LitContracts client to the network");

    console.log("Minting new Capacity Credit...");
    const capacityTokenId = (
      await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 30,
      })
    ).capacityTokenIdStr;
    console.log(`Minted new Capacity Credit with ID: ${capacityTokenId}`);
    return capacityTokenId;
  } catch (error) {
    console.error(error);
  }
};
