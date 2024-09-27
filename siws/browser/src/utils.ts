import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNetwork } from "@lit-protocol/constants";
import ipfsOnlyHash from "typestub-ipfs-only-hash";

export const mintCapacityCredit = async (
  ethersSigner: ethers.providers.JsonRpcSigner
) => {
  try {
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.Habanero,
    });
    await litContracts.connect();

    const capacityTokenId = (
      await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 30,
      })
    ).capacityTokenIdStr;
    return capacityTokenId;
  } catch (error) {
    console.error(error);
  }
};

export async function calculateLitActionCodeCID(
  input: string
): Promise<string> {
  try {
    const cid = await ipfsOnlyHash.of(input);
    return cid;
  } catch (error) {
    console.error("Error calculating CID for litActionCode:", error);
    throw error;
  }
}
