import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { disconnectWeb3 } from "@lit-protocol/auth-browser";
import * as ethers from "ethers";

import { litActionCode } from "./litAction";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("myButton").addEventListener("click", buttonClick);
});

async function buttonClick() {
  try {
    console.log("Clicked");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const ethersSigner = provider.getSigner();
    console.log("Connected account:", await ethersSigner.getAddress());

    const litNodeClient = await getLitNodeClient();

    const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);
    console.log("Got Session Signatures!");

    const litActionSignatures = await litNodeClient.executeJs({
      sessionSigs,
      code: litActionCode,
      jsParams: {
        dataToSign: "Hello World",
        publicKey:
          "0x04f444e7d05b5a7c0eeec713eb66018837e7ea3913da3fc1f1203142a4b67ad48b8adb5ce66045a400f2fc5d6fde6cff1719568dbeeb6466d6782ded45e5fd810a",
      },
      // jsParams: {
      //   conditions: [
      //     {
      //       conditionType: "evmBasic",
      //       contractAddress: "",
      //       standardContractType: "",
      //       chain: "ethereum",
      //       method: "eth_getBalance",
      //       parameters: [":userAddress", "latest"],
      //       returnValueTest: {
      //         comparator: ">=",
      //         value: "1",
      //       },
      //     },
      //   ],
      // sessionSigs,
      // chain: "ethereum",
      // },
    });
    console.log("litActionSignatures: ", litActionSignatures);
  } catch (error) {
    console.error(error);
  } finally {
    // disconnectWeb3();
  }
}

async function getLitNodeClient() {
  const litNodeClient = new LitNodeClient({
    litNetwork: "cayenne",
  });

  console.log("Connecting litNodeClient to network...");
  await litNodeClient.connect();

  console.log("litNodeClient connected!");
  return litNodeClient;
}

function getAuthNeededCallback(litNodeClient, ethersSigner) {
  return async ({ resourceAbilityRequests, expiration, uri }) => {
    console.log("resources", resourceAbilityRequests);

    const toSign = await createSiweMessageWithRecaps({
      uri,
      expiration,
      resources: resourceAbilityRequests,
      walletAddress: await ethersSigner.getAddress(),
      nonce: await litNodeClient.getLatestBlockhash(),
      litNodeClient,
    });

    const authSig = await generateAuthSig({
      signer: ethersSigner,
      toSign,
    });

    return authSig;
  };
}

async function getSessionSigs(litNodeClient, ethersSigner) {
  console.log("Getting Session Signatures...");
  return litNodeClient.getSessionSigs({
    chain: "ethereum",
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 48 hours
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource("*"),
        ability: LitAbility.PKPSigning,
      },
      {
        resource: new LitActionResource("*"),
        ability: LitAbility.LitActionExecution,
      },
      // {
      //   resource: new LitActionResource("*"),
      //   ability: LitAbility.AccessControlConditionSigning,
      // },
      // {
      //   resource: new LitActionResource("*"),
      //   ability: LitAbility.AccessControlConditionDecryption,
      // },
    ],
    authNeededCallback: getAuthNeededCallback(litNodeClient, ethersSigner),
  });
}
