import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNetwork } from "@lit-protocol/constants";
import ipfsOnlyHash from "typestub-ipfs-only-hash";

export const getPkpInfoFromMintReceipt = async (
  txReceipt: ethers.ContractReceipt,
  litContractsClient: LitContracts
) => {
  const pkpMintedEvent = txReceipt!.events!.find(
    (event) =>
      event.topics[0] ===
      "0x3b2cc0657d0387a736293d66389f78e4c8025e413c7a1ee67b7707d4418c46b8"
  );

  const publicKey = "0x" + pkpMintedEvent!.data.slice(130, 260);
  const tokenId = ethers.utils.keccak256(publicKey);
  const ethAddress = await litContractsClient.pkpNftContract.read.getEthAddress(
    tokenId
  );

  return {
    tokenId: ethers.BigNumber.from(tokenId).toString(),
    publicKey,
    ethAddress,
  };
};

export const mintCapacityCredit = async (ethersSigner: ethers.Wallet) => {
  try {
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.Datil,
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
    console.error("Error minting capacity credit:", error);
    throw error;
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

export const getSolRpcConditions = async (
  address: string,
  litActionCode: string
) => {
  return [
    {
      method: "",
      params: [":userAddress"],
      pdaParams: [],
      pdaInterface: { offset: 0, fields: {} },
      pdaKey: "",
      chain: "solana",
      returnValueTest: {
        key: "",
        comparator: "=",
        value: address,
      },
    },
    { operator: "and" },
    {
      method: "",
      params: [":currentActionIpfsId"],
      pdaParams: [],
      pdaInterface: { offset: 0, fields: {} },
      pdaKey: "",
      chain: "solana",
      returnValueTest: {
        key: "",
        comparator: "=",
        value: await calculateLitActionCodeCID(litActionCode),
      },
    },
  ];
};
