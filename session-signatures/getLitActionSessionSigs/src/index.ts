import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, LIT_RPC, AuthMethodScope } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import * as ethers from "ethers";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const getSessionSigsLitAction = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: true,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.DatilDev,
      debug: false,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    console.log("🔄 Minting new PKP...");
    const pkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
    console.log(
      `✅ Minted new PKP with public key: ${pkp.publicKey} and ETH address: ${pkp.ethAddress}`
    );

    // add permitted auth method
    // https://explorer.litprotocol.com/ipfs/QmTaYbqnGwrmseoDQdTNoU9FNzaiaTpKApgMFWqbsWs4Cr
    await litContracts.addPermittedAction({
      ipfsId: "QmTaYbqnGwrmseoDQdTNoU9FNzaiaTpKApgMFWqbsWs4Cr",
      pkpTokenId: pkp.tokenId,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });

    const litActionCode = `(async () => {LitActions.setResponse({ response: makeItTrue });})();`;

    console.log("🔄 Getting Session Sigs...");
    const sessionSignatures = await litNodeClient.getLitActionSessionSigs({
      pkpPublicKey: pkp.publicKey!,
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      litActionCode: Buffer.from(litActionCode).toString("base64"),
      jsParams: {
        makeItTrue: "true",
      },
    });
    console.log("✅ Got Session Sigs");

    return sessionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
