import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitAccessControlConditionResource,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { disconnectWeb3 } from "@lit-protocol/auth-browser";
import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { SiweMessage } from "siwe";

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
    // const pkp = await mintPkp(ethersSigner);
    // console.log("Minted PKP Public Key", pkp.publicKey);

    const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);
    console.log("Got Session Signatures!");

    const authSig = await genAuthSig(litNodeClient, ethersSigner);
    console.log("Got Auth Sig for conditional check!", authSig);

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
            parameters: [":userAddress"],
            returnValueTest: {
              comparator: "=",
              value: "0xA89543a7145C68E52a4D584f1ceb123605131211",
            },
          },
        ],
        authSig,
        chain: "ethereum",
        dataToSign: ethers.utils.arrayify(
          ethers.utils.keccak256([1, 2, 3, 4, 5])
        ),
        // publicKey: pkp.publicKey,
        publicKey:
          "041e7a220a697f47491525798337bfaac6073c6094fdde9187d749d28d947f59fe73fbae024fc0b87d2a61068ea8087e94ecc843820752295307537f9d06432876",
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
    litNetwork: LitNetwork.Cayenne,
  });

  console.log("Connecting litNodeClient to network...");
  await litNodeClient.connect();

  console.log("litNodeClient connected!");
  return litNodeClient;
}

async function mintPkp(ethersSigner) {
  const litContracts = new LitContracts({
    signer: ethersSigner,
    network: LitNetwork.Cayenne,
  });

  await litContracts.connect();

  return (await litContracts.pkpNftContractUtils.write.mint()).pkp;
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
      {
        resource: new LitAccessControlConditionResource("*"),
        ability: LitAbility.AccessControlConditionSigning,
      },
    ],
    authNeededCallback: getAuthNeededCallback(litNodeClient, ethersSigner),
  });
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

    return await generateAuthSig({
      signer: ethersSigner,
      toSign,
    });
  };
}

async function genAuthSig(litNodeClient, ethersSigner) {
  const siweMessage = new SiweMessage({
    domain: "http://localhost", // change to your domain ex: example.app.com
    address: await ethersSigner.getAddress(),
    statement: "Sign a session key to use with Lit Protocol", // configure to what ever you would like
    uri: "http://localhost",
    version: "1",
    chainId: "1",
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 48 hours,
    nonce: await litNodeClient.getLatestBlockhash(),
  });

  return await generateAuthSig({
    signer: ethersSigner,
    toSign: siweMessage.prepareMessage(),
  });
}
