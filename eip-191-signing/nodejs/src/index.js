import { LitNodeClientNodeJs } from "@lit-protocol/lit-node-client-nodejs";
import { LitNetwork, LIT_RPC } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  providers as ethersProviders,
  utils as ethersUtils,
  Wallet,
} from "ethers";

import { litActionCode } from "./litAction.js";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PKP_PUBLIC_KEY = process.env.PKP_PUBLIC_KEY;

(async () => {
  let litNodeClient;

  try {
    const wallet = getWallet();
    litNodeClient = await getLitNodeClient();

    const sessionSigs = await getSessionSigs(litNodeClient, wallet);
    console.log("Got Session Signatures!");

    const litActionSignatures = await litNodeClient.executeJs({
      sessionSigs,
      code: litActionCode,
      jsParams: {
        dataToSign: ethersUtils.arrayify(
          ethersUtils.keccak256([1, 2, 3, 4, 5])
        ),
        publicKey: await getPkpPublicKey(wallet),
        sigName: "sig",
      },
    });
    console.log("litActionSignatures: ", litActionSignatures);

    verifySignature(litActionSignatures.signatures.sig);
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient.disconnect();
  }
})();

function getWallet(privateKey) {
  if (privateKey !== undefined)
    return new Wallet(
      privateKey,
      new ethersProviders.JsonRpcProvider(
        LIT_RPC.VESUVIUS
      )
    );

  if (PRIVATE_KEY === undefined)
    throw new Error("Please provide the env: PRIVATE_KEY");

  return new Wallet(
    PRIVATE_KEY,
    new ethersProviders.JsonRpcProvider(
      LIT_RPC.VESUVIUS
    )
  );
}

async function getPkpPublicKey(ethersSigner) {
  if (PKP_PUBLIC_KEY !== undefined && PKP_PUBLIC_KEY !== "")
    return PKP_PUBLIC_KEY;

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

async function getLitNodeClient() {
  const litNodeClient = new LitNodeClientNodeJs({
    litNetwork: LitNetwork.DatilDev,
  });

  console.log("Connecting litNodeClient to network...");
  await litNodeClient.connect();

  console.log("litNodeClient connected!");
  return litNodeClient;
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

function verifySignature(signature) {
  console.log("Verifying signature...");
  const dataSigned = `0x${signature.dataSigned}`;
  const encodedSig = ethersUtils.joinSignature({
    v: signature.recid,
    r: `0x${signature.r}`,
    s: `0x${signature.s}`,
  });

  const recoveredPubkey = ethersUtils.recoverPublicKey(dataSigned, encodedSig);
  console.log("Recovered uncompressed public key: ", recoveredPubkey);

  const recoveredAddress = ethersUtils.recoverAddress(dataSigned, encodedSig);
  console.log("Recovered address from signature: ", recoveredAddress);
}
