import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, LIT_RPC, LIT_ABILITY } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitPKPResource } from "@lit-protocol/auth-helpers";
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';
import * as ethers from "ethers";
import { LocalStorage } from "node-localstorage";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const getSessionSigsPKP = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilTest,
      debug: false,
      storageProvider: {
        provider: new LocalStorage("./lit_storage.db"),
      },
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.DatilTest,
      debug: false,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    console.log("🔄 Minting new PKP...");
    const pkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
    console.log(
      `✅ Minted new PKP with public key: ${pkp.publicKey} and ETH address: ${pkp.ethAddress}`
    );

    console.log("🔄 Minting Capacity Credits NFT...");
    const capacityTokenId = (
      await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 1,
      })
    ).capacityTokenIdStr;
    console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersSigner,
        capacityTokenId,
        delegateeAddresses: [pkp.ethAddress],
        uses: "1",
      });
    console.log(`✅ Created the capacityDelegationAuthSig`);

    console.log("🔄 Creating AuthMethod using the ethersSigner...")
    const authMethod = await EthWalletProvider.authenticate({
      signer: ethersSigner,
      litNodeClient,
    });
    console.log("✅ Finished creating the AuthMethod")

    console.log("🔄 Getting the Session Sigs for the PKP...");
    const sessionSignatures = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: pkp.publicKey!,
      capabilityAuthSigs: [capacityDelegationAuthSig],
      authMethods: [authMethod],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LIT_ABILITY.PKPSigning,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log("✅ Got PKP Session Sigs");
    return sessionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
