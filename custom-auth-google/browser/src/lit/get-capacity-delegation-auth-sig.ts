import { LitNodeClient } from "@lit-protocol/lit-node-client";
import type { ethers } from "ethers";
import type { MintedPkp } from "./get-pkp-session-sigs";

export const getCapacityDelegationAuthSig = async (
  litNodeClient: LitNodeClient,
  ethersSigner: ethers.Signer,
  mintedPkp: MintedPkp,
  capacityTokenId: string
) => {
  console.log("🔄 Creating capacityDelegationAuthSig...");
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: ethersSigner,
      uses: "1",
      delegateeAddresses: [mintedPkp.ethAddress],
      capacityTokenId,
    });
  console.log(`✅ Created the capacityDelegationAuthSig`);
  return capacityDelegationAuthSig;
};
