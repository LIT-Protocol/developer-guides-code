import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, LIT_RPC } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import * as ethers from "ethers";

import { litActionCode } from "./litAction";
import { getEnv } from "./utils";

const LIT_PKP_PUBLIC_KEY = process.env.LIT_PKP_PUBLIC_KEY;
const LIT_CAPACITY_CREDIT_TOKEN_ID = process.env.LIT_CAPACITY_CREDIT_TOKEN_ID;
const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const LIT_NETWORK = LitNetwork.DatilTest;

export async function signEIP191() {
  let litNodeClient: LitNodeClient;
  let pkpInfo: {
    tokenId?: string;
    publicKey?: string;
    ethAddress?: string;
  } = {
    publicKey: LIT_PKP_PUBLIC_KEY,
  };
  try {
    const ethersWallet = new ethers.Wallet(ETHEREUM_PRIVATE_KEY, new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE))
    console.log("🔄 Connecting to the Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to the Lit network");

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersWallet,
      network: LIT_NETWORK,
      debug: false,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    if (LIT_PKP_PUBLIC_KEY === undefined || LIT_PKP_PUBLIC_KEY === "") {
      console.log("🔄 PKP wasn't provided, minting a new one...");
      pkpInfo = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
      console.log("✅ PKP successfully minted");
      console.log(`ℹ️  PKP token ID: ${pkpInfo.tokenId}`);
      console.log(`ℹ️  PKP public key: ${pkpInfo.publicKey}`);
      console.log(`ℹ️  PKP ETH address: ${pkpInfo.ethAddress}`);
    } else {
      console.log(`ℹ️  Using provided PKP: ${LIT_PKP_PUBLIC_KEY}`);
      pkpInfo = {
        publicKey: LIT_PKP_PUBLIC_KEY,
        ethAddress: ethers.utils.computeAddress(`0x${LIT_PKP_PUBLIC_KEY}`),
      };
    }

    let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (capacityTokenId === "" || capacityTokenId === undefined) {
      console.log("🔄 No Capacity Credit provided, minting a new one...");
      capacityTokenId = (
        await litContracts.mintCapacityCreditsNFT({
          requestsPerKilosecond: 10,
          daysUntilUTCMidnightExpiration: 1,
        })
      ).capacityTokenIdStr;
      console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    } else {
      console.log(
        `ℹ️  Using provided Capacity Credit with ID: ${LIT_CAPACITY_CREDIT_TOKEN_ID}`
      );
    }

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersWallet,
        capacityTokenId,
        delegateeAddresses: [ethersWallet.address],
        uses: "1",
      });
    console.log("✅ Capacity Delegation Auth Sig created");

    console.log("🔄 Getting Session Sigs via an Auth Sig...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      capabilityAuthSigs: [capacityDelegationAuthSig],
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
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
      authNeededCallback: async ({
        resourceAbilityRequests,
        expiration,
        uri,
      }) => {
        const toSign = await createSiweMessageWithRecaps({
          uri: uri!,
          expiration: expiration!,
          resources: resourceAbilityRequests!,
          walletAddress: ethersWallet.address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersWallet,
          toSign,
        });
      },
    });
    console.log("✅ Got Session Sigs via an Auth Sig");

    console.log("🔄 Attempting to execute the Lit Action, signing the EIP-191..");
    const litActionSignatures = await litNodeClient.executeJs({
      sessionSigs,
      code: litActionCode,
      jsParams: {
        dataToSign: ethers.utils.arrayify(
          ethers.utils.keccak256([1, 2, 3, 4, 5])
        ),
        publicKey: pkpInfo.publicKey,
        sigName: "sig",
      },
    });
    console.log("✅ EIP-191 signing successful");

    console.log("🔄 Verifying signature...");
    const signature = litActionSignatures.signatures.sig;
    const dataSigned = `0x${signature.dataSigned}`;
    const encodedSig = ethers.utils.joinSignature({
      v: signature.recid,
      r: `0x${signature.r}`,
      s: `0x${signature.s}`,
    });

    const recoveredPubkey = ethers.utils.recoverPublicKey(
      dataSigned,
      encodedSig
    );
    const recoveredAddress = ethers.utils.recoverAddress(
      dataSigned,
      encodedSig
    );
    console.log(`✅ Recovered uncompressed public key: ${recoveredPubkey}`);
    console.log(`✅ Recovered address from signature: ${recoveredAddress}`);
    return { pubKey: recoveredPubkey, address: recoveredAddress};
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
}
