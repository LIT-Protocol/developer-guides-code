import { LitNetwork, LIT_RPC } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  createSiweMessage,
  generateAuthSig,
  LitAbility,
  LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";
import ethers from "ethers";

import { getEnv } from "./utils";
import WhitelistEIP1271 from "./WhitelistEIP1271.json";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const ANVIL_PRIVATE_KEY_1 = getEnv("ANVIL_PRIVATE_KEY_1");
const ANVIL_PRIVATE_KEY_2 = getEnv("ANVIL_PRIVATE_KEY_2");
const ANVIL_RPC_URL = getEnv("ANVIL_RPC_URL");
const DEPLOYED_EIP1271_WHITELIST_CONTRACT = getEnv(
  "DEPLOYED_EIP1271_WHITELIST_CONTRACT"
);

export const runExample = async () => {
  let litNodeClient: LitNodeClient;

  try {
    // const ethersSigner = new ethers.Wallet(
    //   ETHEREUM_PRIVATE_KEY,
    //   new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    // );

    const provider = new ethers.providers.JsonRpcProvider(ANVIL_RPC_URL);

    const wallet1 = new ethers.Wallet(ANVIL_PRIVATE_KEY_1, provider);
    const wallet2 = new ethers.Wallet(ANVIL_PRIVATE_KEY_2, provider);

    const whitelistEIP1271_wallet1 = new ethers.Contract(
      DEPLOYED_EIP1271_WHITELIST_CONTRACT,
      WhitelistEIP1271.abi,
      wallet1
    );
    const whitelistEIP1271_wallet2 = new ethers.Contract(
      DEPLOYED_EIP1271_WHITELIST_CONTRACT,
      WhitelistEIP1271.abi,
      wallet2
    );

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilTest,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    const siweMessage = await createSiweMessage({
      walletAddress: DEPLOYED_EIP1271_WHITELIST_CONTRACT,
      nonce: await litNodeClient.getLatestBlockhash(),
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      resources: [
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: LitAbility.AccessControlConditionDecryption,
        },
      ],
      litNodeClient,
    });
    const siweMessageHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(siweMessage)
    );

    const wallet1Signature = wallet1._signingKey().signDigest(siweMessageHash);
    let tx = await whitelistEIP1271_wallet1.signTx(
      siweMessageHash,
      ethers.utils.joinSignature(wallet1Signature)
    );
    let receipt = await tx.wait();

    const wallet2Signature = wallet2._signingKey().signDigest(siweMessageHash);
    tx = await whitelistEIP1271_wallet2.signTx(
      siweMessageHash,
      ethers.utils.joinSignature(wallet2Signature)
    );
    receipt = await tx.wait();

    const combinedSignatures = await whitelistEIP1271_wallet1.signatures(
      siweMessageHash
    );
    const isValidSignature = await whitelistEIP1271_wallet1.isValidSignature(
      siweMessageHash,
      combinedSignatures
    );
    console.log("isValidSignature", isValidSignature);

    console.log("🔄 Getting Session Sigs via an Auth Sig...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      resourceAbilityRequests: [
        // {
        //   resource: new LitAccessControlConditionResource("*"),
        //   ability: LitAbility.AccessControlConditionDecryption,
        // },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }) => {
        // const toSign = await createSiweMessage({
        //   uri,
        //   expiration,
        //   resources: resourceAbilityRequests,
        //   walletAddress: await ethersSigner.getAddress(),
        //   nonce: await litNodeClient.getLatestBlockhash(),
        //   litNodeClient,
        // });

        // return await generateAuthSig({
        //   signer: ethersSigner,
        //   toSign,
        // });

        return {
          sig: combinedSignatures,
          derivedVia: "EIP1271",
          signedMessage: siweMessage,
          address: DEPLOYED_EIP1271_WHITELIST_CONTRACT,
        };
      },
    });
    console.log("✅ Got Session Sigs via an Auth Sig");
    console.log(sessionSigs);
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
