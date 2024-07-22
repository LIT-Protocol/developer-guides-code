import { AccessControlConditions } from "@lit-protocol/types";
import { LitNodeClient, decryptToString } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { ethers } from "ethers";
import {
  LitAbility,
  LitAccessControlConditionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";

import { DEFAULT_AUTHORIZED_ETH_ADDRESS } from "./encryptString";
import { mintCapacityCredit } from "./utils";

const DEFAULT_ACCESS_CONTROL_CONDITIONS = [
  {
    contractAddress: "",
    standardContractType: "",
    chain: "ethereum",
    method: "",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: "=",
      value: DEFAULT_AUTHORIZED_ETH_ADDRESS,
    },
  },
];
const DEFAULT_CAPACITY_CREDIT_TOKEN_ID = "";

export const decryptString = async (
  ciphertext: string = "rGAjRrv1xJgMclM4etouk7z0tU+a1J4BrFsA7c3jkn1Pyw34y2OjRKSqozBKqal4mkUk9m4oHeG6FLQrRmgUDuIiebHYtWV0vD6c14FsJ9Ui1gb7ToVowepOoR7FkOcDrG/44f6nU3o4HEyh3VOYE/4m9gM=",
  dataToEncryptHash: string = "bc0b1d383f84b1b32d29f904597559d1d111f242403dfa4d025c51d186bcd784",
  accessControlConditions: AccessControlConditions = DEFAULT_ACCESS_CONTROL_CONDITIONS,
  capacityCreditTokenId: string | undefined = DEFAULT_CAPACITY_CREDIT_TOKEN_ID
) => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting to wallet...");
    if (typeof window.ethereum === "undefined") {
      throw new Error("❌ Browser wallet extension not installed");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    const ethersSigner = ethersProvider.getSigner();
    const connectedAddress = await ethersSigner.getAddress();
    console.log(`✅ Connected to wallet: ${connectedAddress}`);

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilTest,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    let _capacityCreditTokenId: string | undefined = capacityCreditTokenId;
    if (capacityCreditTokenId === undefined || capacityCreditTokenId === "") {
      _capacityCreditTokenId = await mintCapacityCredit(ethersSigner);

      if (_capacityCreditTokenId === undefined)
        throw new Error("❌ Failed to mint new Capacity Credit");
    }

    console.log("🔄 Getting Capacity Credit delegation auth sig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        uses: "1",
        dAppOwnerWallet: ethersSigner,
        capacityTokenId: _capacityCreditTokenId,
      });
    console.log("✅ Got Capacity Credit delegation auth sig");

    console.log("🔄 Getting EOA Session Sigs...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource(
            await LitAccessControlConditionResource.generateResourceString(
              accessControlConditions,
              dataToEncryptHash
            )
          ),
          ability: LitAbility.AccessControlConditionDecryption,
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
          walletAddress: connectedAddress,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
      capabilityAuthSigs: [capacityDelegationAuthSig],
    });
    console.log("✅ Got EOA Session Sigs");

    console.log("🔄 Decrypting string...");
    const decryptionResult = await decryptToString(
      {
        chain: "ethereum",
        ciphertext,
        dataToEncryptHash,
        accessControlConditions,
        sessionSigs,
      },
      litNodeClient
    );
    console.log(`✅ Decrypted string: ${decryptionResult}`);
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
