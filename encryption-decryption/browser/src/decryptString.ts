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
const DEFAULT_CAPACITY_CREDIT_TOKEN_ID = "1783";

export const decryptString = async (
  ciphertext: string = "guUa4qoGu7smAEnIhPYnym015upeM1+YwWq9aMCk1edShcfrVIvn3J1G2pClJxKaTvud1yQ9a381sVRtMiYF5JAB3+kWyqtxOMm8sgyeIFQiHEPsW03QfCAuYvDaYBog07j2AlfUXwoN9a4bq/SzreuDcwM=",
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
      litNetwork: LitNetwork.Habanero,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    let _capacityCreditTokenId = capacityCreditTokenId;
    if (capacityCreditTokenId === undefined) {
      _capacityCreditTokenId = await mintCapacityCredit(ethersSigner);
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
