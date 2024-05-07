import { LitNodeClientNodeJs } from "@lit-protocol/lit-node-client-nodejs";
import { AuthMethodType, LitNetwork } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { BigNumber, providers as ethersProviders, Wallet } from "ethers";

import { litActionCode } from "./litAction.js";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

(async () => {
  let litNodeClient;

  try {
    const wallet = getWallet();

    litNodeClient = new LitNodeClientNodeJs({
      litNetwork: LitNetwork.Cayenne,
    });
    console.log("Connecting litNodeClient to network...");
    await litNodeClient.connect();
    console.log("litNodeClient connected!");

    const sessionSigs = await getSessionSigs(litNodeClient, wallet);
    console.log("Got Session Signatures!");

    const authMethod = {
      authMethodType: AuthMethodType.EthWallet,
      accessToken: JSON.stringify(await genAuthSig(litNodeClient, wallet)),
    };

    const litAuthClient = new EthWalletProvider({ litNodeClient });
    const authMethodId = await litAuthClient.getAuthMethodId(authMethod);

    const keyClaimResult = await litNodeClient.executeJs({
      sessionSigs,
      code: litActionCode,
      jsParams: {
        userId: "yourUserId",
      },
    });
    console.log("keyClaimResult: ", keyClaimResult);

    const litContractClient = new LitContracts({
      signer: wallet,
    });
    console.log("Connecting litContractClient to network...");
    await litContractClient.connect();
    console.log("litContractClient connected!");

    const tx =
      await litContractClient.pkpHelperContract.write.claimAndMintNextAndAddAuthMethods(
        keyClaimResult.claims["yourUserId"],
        {
          keyType: 2,
          permittedIpfsCIDs: [],
          permittedIpfsCIDScopes: [],
          permittedAddresses: [],
          permittedAddressScopes: [],
          permittedAuthMethodTypes: [AuthMethodType.EthWallet],
          permittedAuthMethodIds: [authMethodId],
          permittedAuthMethodPubkeys: ["0x"],
          permittedAuthMethodScopes: [],
          addPkpEthAddressAsPermittedAddress: true,
          sendPkpToItself: true,
        }
      );
    console.log("Claim and Mint Tx:", tx);
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
        "https://chain-rpc.litprotocol.com/http"
      )
    );

  if (PRIVATE_KEY === undefined)
    throw new Error("Please provide the env: PRIVATE_KEY");

  return new Wallet(
    PRIVATE_KEY,
    new ethersProviders.JsonRpcProvider(
      "https://chain-rpc.litprotocol.com/http"
    )
  );
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
