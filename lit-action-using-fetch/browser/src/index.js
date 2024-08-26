import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
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

    const message = new Uint8Array(
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("Hello world")
      )
    );
    const litActionSignatures = await litNodeClient.executeJs({
      sessionSigs,
      code: litActionCode,
      jsParams: {
        toSign: message,
        publicKey: await getPkpPublicKey(),
        sigName: "sig",
      },
    });
    console.log("litActionSignatures: ", litActionSignatures);
  } catch (error) {
    console.error(error);
  } finally {
    disconnectWeb3();
  }
}

async function getLitNodeClient() {
  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
  });

  console.log("Connecting litNodeClient to network...");
  await litNodeClient.connect();

  console.log("litNodeClient connected!");
  return litNodeClient;
}

async function getPkpPublicKey(ethersSigner) {
  if (
    process.env.PKP_PUBLIC_KEY !== undefined &&
    process.env.PKP_PUBLIC_KEY !== ""
  )
    return process.env.PKP_PUBLIC_KEY;

  const pkp = await mintPkp(ethersSigner);
  console.log("Minted PKP!", pkp);
  return pkp.publicKey;
}

async function mintPkp(ethersSigner) {
  console.log("Minting new PKP...");
  const litContracts = new LitContracts({
    signer: ethersSigner,
    network: LitNetwork.DatilDev,
  });

  await litContracts.connect();

  return (await litContracts.pkpNftContractUtils.write.mint()).pkp;
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
      {
        resource: new LitPKPResource("*"),
        ability: LitAbility.PKPSigning,
      },
    ],
    authNeededCallback: getAuthNeededCallback(litNodeClient, ethersSigner),
  });
}

function getAuthNeededCallback(litNodeClient, ethersSigner) {
  return async ({ resourceAbilityRequests, expiration, uri }) => {
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
