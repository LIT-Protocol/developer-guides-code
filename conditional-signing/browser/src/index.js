import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,

  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { disconnectWeb3 } from "@lit-protocol/auth-browser";
import { LitContracts } from "@lit-protocol/contracts-sdk";
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
    console.log("ethersSigner:", ethersSigner);
    console.log("Connected account:", await ethersSigner.getAddress());

    const litNodeClient = await getLitNodeClient();

    const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);
    console.log("Got Session Signatures!");

    const authSig = await genAuthSig(litNodeClient, ethersSigner);
    console.log("Got Auth Sig for Lit Action conditional check!", authSig);

    const pkp = await getPkpPublicKey(ethersSigner);
    console.log("Got PKP Public Key!", pkp.publicKey);

    const litActionSignatures = await litNodeClient.executeJs({
      sessionSigs,
      code: litActionCode,
      jsParams: {
        conditions: [
          {
            conditionType: "evmBasic",
            contractAddress: "",
            standardContractType: "",
            chain: "ethereum",
            method: "eth_getBalance",
            parameters: [":userAddress", "latest"],
            returnValueTest: {
              comparator: ">=",
              value: "1",
            },
          },
        ],
        authSig,
        chain: "ethereum",
        dataToSign: ethers.utils.arrayify(
          ethers.utils.keccak256([1, 2, 3, 4, 5])
        ),
        publicKey: pkp.publicKey,
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
  ) {
    return process.env.PKP_PUBLIC_KEY;
  }
  console.log("Minting new PKP...");
  const litContracts = new LitContracts({
    signer: ethersSigner,
    network: LitNetwork.DatilDev,
    debug: false,
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
        resource: new LitPKPResource("*"),
        ability: LitAbility.PKPSigning,
      },
      {
        resource: new LitActionResource("*"),
        ability: LitAbility.LitActionExecution,
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

    return await generateAuthSig({
      signer: ethersSigner,
      toSign,
    });
  };
}

async function genAuthSig(litNodeClient, ethersSigner) {
  const toSign = await createSiweMessageWithRecaps({
    uri: "http://localhost",
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    walletAddress: await ethersSigner.getAddress(),
    nonce: await litNodeClient.getLatestBlockhash(),
    litNodeClient: litNodeClient,
  });

  return await generateAuthSig({
    signer: ethersSigner,
    toSign,
  });
}
