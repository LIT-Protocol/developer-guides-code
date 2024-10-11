import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitAbility } from "@lit-protocol/types";
import { ethers } from "ethers";
import { api } from "@lit-protocol/wrapped-keys";
import { LitActionResource } from "@lit-protocol/auth-helpers";

import {
  generateWrappedKey,
  getCapacityCreditDelegationAuthSig,
  getCapacityCreditTokenId,
  getEnv,
  getLitContracts,
  getLitNodeClient,
  getPkpAccessControlCondition,
  getSessionSigsViaPkp,
  mintPkp,
} from "./utils";
import { litActionCode } from "./wrappedKeyLitAction";

const { getEncryptedKey } = api;

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const CAPACITY_CREDIT_TOKEN_ID =
  process.env.CAPACITY_CREDIT_TOKEN_ID || undefined;
const LIT_NETWORK =
  (process.env.LIT_NETWORK as LitNetwork) || LitNetwork.DatilTest;

export const runExample = async (
  messageToSign: string,
  useEip712Signing: boolean
) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    litNodeClient = await getLitNodeClient(LIT_NETWORK);
    const litContracts = await getLitContracts(ethersSigner, LIT_NETWORK);

    let _capacityCreditTokenId = CAPACITY_CREDIT_TOKEN_ID;
    if (_capacityCreditTokenId === undefined) {
      const capacityTokenId = await getCapacityCreditTokenId(litContracts);
      _capacityCreditTokenId = capacityTokenId;
    } else {
      console.log(
        `ℹ️  Using provided capacity credit token with ID: ${_capacityCreditTokenId}`
      );
    }

    const pkpInfo = await mintPkp(litContracts);

    const capacityDelegationAuthSig = await getCapacityCreditDelegationAuthSig(
      litNodeClient,
      ethersSigner,
      pkpInfo.ethAddress,
      _capacityCreditTokenId,
      "5"
    );

    const pkpSessionSigs = await getSessionSigsViaPkp(
      litNodeClient,
      pkpInfo.publicKey,
      ethersSigner,
      [capacityDelegationAuthSig],
      [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ]
    );

    const wrappedKeyInfo = await generateWrappedKey(
      pkpSessionSigs,
      litNodeClient,
      "evm",
      "This is a test memo"
    );

    console.log("🔄 Getting wrapped key metadata...");
    const wrappedKeyMetadata = await getEncryptedKey({
      pkpSessionSigs,
      litNodeClient,
      id: wrappedKeyInfo.id,
    });
    console.log(
      `✅ Got wrapped key metadata: ${JSON.stringify(
        wrappedKeyMetadata,
        null,
        2
      )}`
    );

    console.log("🔄 Signing EIP-712 message with Wrapped Key...");
    const response = await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      code: litActionCode,
      jsParams: {
        accessControlConditions: [
          getPkpAccessControlCondition(wrappedKeyInfo.pkpAddress),
        ],
        ciphertext: wrappedKeyMetadata.ciphertext,
        dataToEncryptHash: wrappedKeyMetadata.dataToEncryptHash,
        messageToSign,
        useEip712Signing,
      },
    });
    console.log("✅ Signed EIP-712 message");

    return {
      signedMessage: response.response as string,
      wrappedKeyEthAddress: ethers.utils.computeAddress(
        wrappedKeyMetadata.publicKey
      ),
    };
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
