import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import { disconnectWeb3 } from "@lit-protocol/auth-browser";
import { getAuthMethodId } from "@lit-protocol/lit-auth-client";
import { AuthMethodType } from "@lit-protocol/constants";
import * as ethers from "ethers";
import { SiweMessage } from "siwe";

import { litActionCode } from "./litAction";

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("mintButton")
    .addEventListener("click", mintButtonClick);
  document
    .getElementById("mintButtonWithAuth")
    .addEventListener("click", mintButtonWithAuthClick);
});

async function mintButtonClick() {
  console.log("Clicked");
  disconnectWeb3();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const ethersSigner = provider.getSigner();
  console.log("Connected account:", await ethersSigner.getAddress());

  const litNodeClient = await getLitNodeClient();

  const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);
  console.log("Got Session Signatures!");

  const result = await litNodeClient.executeJs({
    sessionSigs,
    code: litActionCode,
    authMethods: [],
    jsParams: {
      userId: "foo",
    },
  });

  const litContractClient = new LitContracts({
    signer: ethersSigner,
  });
  const tx = await litContractClient.pkpNftContract.write.claimAndMint(
    2,
    result.claims["foo"].derivedKeyId,
    result.claims["foo"].signatures
  );
  console.log("Claim and Mint Tx:", tx);
}

async function mintButtonWithAuthClick() {
  console.log("Clicked");
  disconnectWeb3();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const ethersSigner = provider.getSigner();
  console.log("Connected account:", await ethersSigner.getAddress());

  const litNodeClient = await getLitNodeClient();

  const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);
  console.log("Got Session Signatures!");

  const authMethod = {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify(sessionSigs),
  };
  const result = await litNodeClient.executeJs({
    sessionSigs,
    code: litActionCode,
    authMethods: [],
    jsParams: {
      userId: "foo",
    },
  });

  const litContractClient = new LitContracts({
    signer: ethersSigner,
  });
  const tx =
    await litContractClient.pkpHelperContract.write.claimAndMintNextAndAddAuthMethods(
      res.claims["foo"],
      {
        keyType: 2,
        permittedIpfsCIDs: [],
        permittedIpfsCIDScopes: [],
        permittedAddresses: [],
        permittedAddressScopes: [],
        permittedAuthMethodTypes: [AuthMethodType.EthWallet],
        permittedAuthMethodIds: [`0x${getAuthMethodId(authMethod)}`],
        permittedAuthMethodPubkeys: [`0x`],
        permittedAuthMethodScopes: [[BigNumber.from("1")]],
        addPkpEthAddressAsPermittedAddress: true,
        sendPkpToItself: true,
      }
    );
  console.log("Claim and Mint Tx:", tx);
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
