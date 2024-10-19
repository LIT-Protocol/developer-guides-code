import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
// import { importer } from "ipfs-unixfs-importer";
// import { Buffer } from "buffer";
import Hash from "ipfs-only-hash";
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
import { AuthMethodScope, AuthMethodType } from "@lit-protocol/constants";

import { litActionCode } from "./litAction";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("myButton").addEventListener("click", buttonClick);
});

function stringToIpfsHash(input) {
  return Hash.of(input);
}

async function buttonClick() {
  try {
    console.log("Clicked");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const ethersSigner = provider.getSigner();
    console.log("Connected account:", await ethersSigner.getAddress());

    const pkpPublicKey = await mintPkp(ethersSigner);

    const litNodeClient = await getLitNodeClient();

    const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner);
    console.log("Got Session Signatures!");

    const response = await litNodeClient.executeJs({
      sessionSigs,
      code: litActionCode,
      jsParams: {
        publicKey: pkpPublicKey,
        sigName: "sig",
      },
    });
    const sig = response.signatures.sig;
    console.log("Got Lit Action Response signature!", sig);
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

async function mintPkp(ethersSigner) {
  console.log("Minting new PKP...");
  const litContracts = new LitContracts({
    signer: ethersSigner,
    network: LitNetwork.DatilDev,
  });

  await litContracts.connect();

  const ipfsHash = await stringToIpfsHash(litActionCode);
  // get mint cost
  const mintCost = await litContracts.pkpNftContract.read.mintCost();
  console.log("Mint cost:", mintCost);

  /*
      function mintNextAndAddAuthMethods(
        uint256 keyType,
        uint256[] memory permittedAuthMethodTypes,
        bytes[] memory permittedAuthMethodIds,
        bytes[] memory permittedAuthMethodPubkeys,
        uint256[][] memory permittedAuthMethodScopes,
        bool addPkpEthAddressAsPermittedAddress,
        bool sendPkpToItself
        */

  const txn =
    await litContracts.pkpHelperContract.write.mintNextAndAddAuthMethods(
      2,
      [AuthMethodType.LitAction],
      [ethers.utils.base58.decode(ipfsHash)],
      ["0x"],
      [[AuthMethodScope.SignAnything, AuthMethodScope.PersonalSign]],
      false,
      true,
      { value: mintCost, gasLimit: 4000000000 }
    );
  const receipt = await txn.wait();
  console.log("Minted!", receipt);

  // get the pkp public key from the mint event
  const pkpId = receipt.logs[0].topics[1];
  const pkpInfo = await litContracts.pubkeyRouterContract.read.pubkeys(
    ethers.BigNumber.from(pkpId)
  );
  console.log("PKP Info:", pkpInfo);
  const pkpPublicKey = pkpInfo.pubkey;

  console.log("PKP Public Key:", pkpPublicKey);

  return pkpPublicKey.slice(2);

  // return (await litContracts.pkpNftContractUtils.write.mint()).pkp;
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
