import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import { disconnectWeb3 } from "@lit-protocol/auth-browser";
import * as ethers from "ethers";
import { SiweMessage } from "siwe";

import { litActionCode } from "./litAction";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("myButton").addEventListener("click", buttonClick);
});

async function buttonClick() {
  console.log("Clicked");
  disconnectWeb3();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const ethersSigner = provider.getSigner();
  console.log("Connected account:", await ethersSigner.getAddress());

  const litNodeClient = await getLitNodeClient();

  const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);
  console.log("Got Session Signatures!");

  const litActionSignatures = await litNodeClient.executeJs({
    code: litActionCode,
    sessionSigs,
    jsParams: {
      message: "Hello World",
      publicKey:
        "0x02e5896d70c1bc4b4844458748fe0f936c7919d7968341e391fb6d82c258192e64",
      sigName: "sig1",
    },
  });
  console.log("litActionSignatures: ", litActionSignatures);
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
  return async ({ resources, expiration, uri }) => {
    const nonce = await litNodeClient.getLatestBlockhash();
    const address = await ethersSigner.getAddress();

    const siweMessage = new SiweMessage({
      domain: "localhost", // change to your domain ex: example.app.com
      address,
      statement: "Sign a session key to use with Lit Protocol", // configure to what ever you would like
      uri,
      version: "1",
      chainId: "1",
      expirationTime: expiration,
      resources,
      nonce,
    });

    const messageToSign = siweMessage.prepareMessage();
    const signature = await ethersSigner.signMessage(messageToSign);

    console.log(signature);

    const authSig = {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: messageToSign,
      address,
    };

    return authSig;
  };
}

async function getSessionSigs(litNodeClient, ethersSigner) {
  console.log("Getting Session Signatures...");
  return litNodeClient.getSessionSigs({
    chain: "ethereum",
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    resourceAbilityRequests: [
      {
        resource: new LitActionResource("*"),
        ability: LitAbility.LitActionExecution,
      },
    ],
    authNeededCallback: getAuthNeededCallback(litNodeClient, ethersSigner),
  });
}
