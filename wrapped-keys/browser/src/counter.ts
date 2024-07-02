// export function setupCounter(element: HTMLButtonElement) {
//   let counter = 0
//   const setCounter = (count: number) => {
//     counter = count
//     element.innerHTML = `count is ${counter}`
//   }
//   element.addEventListener('click', () => setCounter(counter + 1))
//   setCounter(0)
// }

import * as ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import {
  LitAbility,
  LitAccessControlConditionResource,
  LitActionResource,
} from "@lit-protocol/auth-helpers";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { GeneratePrivateKeyResult, api } from "@lit-protocol/wrapped-keys";
import { mintPkp } from "./utils";

const { generatePrivateKey } = api;

const ETHEREUM_PRIVATE_KEY = import.meta.env.VITE_ETHEREUM_PRIVATE_KEY;

export const generateWrappedKey = async (
  ethersSigner: ethers.Wallet,
  pkpPublicKey: string,
  evmOrSolana: "evm" | "solana"
) => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Cayenne,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Getting PKP Session Sigs...");
    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey,
      authMethods: [
        await EthWalletProvider.authenticate({
          signer: ethersSigner,
          litNodeClient,
          expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        }),
      ],
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: LitAbility.AccessControlConditionDecryption,
        },
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: LitAbility.AccessControlConditionSigning,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log("✅ Got PKP Session Sigs");

    console.log("🔄 Generating wrapped key...");
    const { pkpAddress, generatedPublicKey } = await generatePrivateKey({
      pkpSessionSigs,
      network: evmOrSolana,
      litNodeClient,
    });
    console.log("✅ Generated wrapped key");
    return { pkpAddress, generatedPublicKey };
  } catch (error) {
    console.error;
  } finally {
    litNodeClient!.disconnect();
  }
};

export const runTheExample = async () => {
  const ethersSigner = new ethers.Wallet(
    ETHEREUM_PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(
      "https://chain-rpc.litprotocol.com/http"
    )
  );

  const mintedPkp = await mintPkp(ethersSigner);

  const { pkpAddress, generatedPublicKey } = (await generateWrappedKey(
    ethersSigner,
    mintedPkp!.publicKey,
    "evm"
  )) as GeneratePrivateKeyResult;

  console.log(pkpAddress, generatedPublicKey);
};
