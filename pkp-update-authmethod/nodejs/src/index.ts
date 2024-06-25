import { LitNodeClient } from "@lit-protocol/lit-node-client";
import * as ethers from "ethers";
import {
  AuthMethodScope,
  AuthMethodType,
  LitNetwork,
} from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const doTheThing = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    console.log(ethersSigner.address);

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.Cayenne,
      debug: true,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    console.log("🔄 Minting new PKP...");
    const mintedPkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
    console.log(
      `✅ Minted new PKP with public key: ${mintedPkp.publicKey} and ETH address: ${mintedPkp.ethAddress}`
    );

    console.log("🔄 Adding Lit Action Auth Method to PKP...");
    const addAuthMethodReceipt = await litContracts.addPermittedAction({
      pkpTokenId: mintedPkp.tokenId,
      ipfsId: "QmYHJkmnVXB2hCd53uThfwsTkLEB2Ak4J9cu5wL5SBezVv",
      authMethodScopes: [AuthMethodScope.SignAnything],
    });
    console.log(
      `✅ Added Lit Action Auth Method to PKP. Transaction hash: ${addAuthMethodReceipt.transactionHash}`
    );

    console.log("🔄 Transferring ownership of PKP to itself...");
    const transferPkpOwnershipTx =
      await litContracts.pkpNftContract.write.transferFrom(
        ethersSigner.address,
        mintedPkp.ethAddress,
        mintedPkp.tokenId,
        {
          gasLimit: 1_000_000,
        }
      );
    const transferPkpOwnershipReceipt = await transferPkpOwnershipTx.wait();
    console.log(
      `✅ Transferred ownership of PKP NFT. Transaction hash: ${transferPkpOwnershipReceipt.transactionHash}`
    );

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Cayenne,
      debug: true,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    // @ts-ignore
    const toSign = await createSiweMessageWithRecaps({
      uri: "http://localhost",
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      walletAddress: ethersSigner.address,
      nonce: await litNodeClient.getLatestBlockhash(),
      litNodeClient,
    });

    console.log("🔄 Getting PKP Session Sigs using Lit Action Auth Method...");
    const sessionSigs = await litNodeClient.getLitActionSessionSigs({
      pkpPublicKey: mintedPkp.publicKey,
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
      litActionIpfsId: "QmYHJkmnVXB2hCd53uThfwsTkLEB2Ak4J9cu5wL5SBezVv",
      jsParams: {
        authSig: JSON.stringify(
          await generateAuthSig({
            signer: ethersSigner,
            toSign,
          })
        ),
      },
    });
    console.log("✅ Got PKP Session Sigs using Lit Action Auth Method");

    return mintedPkp;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
