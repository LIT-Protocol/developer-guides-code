import { LitNodeClient } from "@lit-protocol/lit-node-client";
import * as ethers from "ethers";
import { AuthMethodScope, LitNetwork } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { PKPEthersWallet, ethRequestHandler } from "@lit-protocol/pkp-ethers";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY_A = getEnv("ETHEREUM_PRIVATE_KEY_A");
const ETHEREUM_PRIVATE_KEY_B = getEnv("ETHEREUM_PRIVATE_KEY_B");
const LIT_ACTION_CHECK_ADDRESS_A = getEnv("LIT_ACTION_CHECK_ADDRESS_A");
const LIT_ACTION_CHECK_ADDRESS_B = getEnv("LIT_ACTION_CHECK_ADDRESS_B");
const PKP_PERMISSIONS_CONTRACT_ADDRESS =
  "0xD01c9C30f8F6fa443721629775e1CC7DD9c9e209";
const PKP_PERMISSIONS_CONTRACT_ABI = [
  "function addPermittedAction(uint256 tokenId, bytes ipfsCID, uint256[] scopes)",
  "function removePermittedAction(uint256 tokenId, bytes ipfsCID)",
];
const PKP_PERMISSIONS_ETHERS_CONTRACT = new ethers.Contract(
  PKP_PERMISSIONS_CONTRACT_ADDRESS,
  PKP_PERMISSIONS_CONTRACT_ABI,
  new ethers.providers.JsonRpcProvider("https://chain-rpc.litprotocol.com/http")
);

export const doTheThing = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSignerA = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY_A,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );
    const ethersSignerB = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY_B,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSignerA,
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

    console.log("🔄 Adding Lit Action Auth Method A to PKP...");
    const addAuthMethodAReceipt = await litContracts.addPermittedAction({
      pkpTokenId: mintedPkp.tokenId,
      ipfsId: LIT_ACTION_CHECK_ADDRESS_A,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });
    console.log(
      `✅ Added Lit Action Auth Method A to PKP. Transaction hash: ${addAuthMethodAReceipt.transactionHash}`
    );

    console.log("🔄 Transferring ownership of PKP to itself...");
    const transferPkpOwnershipReceipt = await (
      await litContracts.pkpNftContract.write.transferFrom(
        ethersSignerA.address,
        mintedPkp.ethAddress,
        mintedPkp.tokenId,
        {
          gasLimit: 1_000_000,
        }
      )
    ).wait();
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

    console.log(
      "🔄 Getting PKP Session Sigs using Lit Action Auth Method A..."
    );
    const pkpSessionSigsA = await litNodeClient.getLitActionSessionSigs({
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
      litActionIpfsId: LIT_ACTION_CHECK_ADDRESS_A,
      jsParams: {
        authSig: JSON.stringify(
          await generateAuthSig({
            signer: ethersSignerA,
            // @ts-ignore
            toSign: await createSiweMessageWithRecaps({
              uri: "http://localhost",
              expiration: new Date(
                Date.now() + 1000 * 60 * 60 * 24
              ).toISOString(), // 24 hours
              walletAddress: ethersSignerA.address,
              nonce: await litNodeClient.getLatestBlockhash(),
              litNodeClient,
            }),
          })
        ),
      },
    });
    console.log("✅ Got PKP Session Sigs using Lit Action Auth Method A");

    console.log("🔄 Funding PKP ETH Address...");
    const fundPkpTxReceipt = await (
      await ethersSignerA.sendTransaction({
        to: mintedPkp.ethAddress,
        value: ethers.utils.parseEther("0.000001"),
      })
    ).wait();
    console.log(
      `✅ Funded PKP ETH Address. Transaction hash: ${fundPkpTxReceipt.transactionHash}`
    );

    const pkpEthersWalletA = new PKPEthersWallet({
      litNodeClient,
      pkpPubKey: mintedPkp.publicKey,
      controllerSessionSigs: pkpSessionSigsA,
    });
    await pkpEthersWalletA.init();

    console.log("🔄 Adding Lit Action Auth Method B to PKP...");
    const addAuthMethodTxData =
      PKP_PERMISSIONS_ETHERS_CONTRACT.interface.encodeFunctionData(
        "addPermittedAction",
        [
          mintedPkp.tokenId,
          ethers.utils.toUtf8Bytes(LIT_ACTION_CHECK_ADDRESS_B),
          [AuthMethodScope.SignAnything],
        ]
      );

    const addAuthMethodTx = {
      from: mintedPkp.ethAddress,
      to: PKP_PERMISSIONS_CONTRACT_ADDRESS,
      data: addAuthMethodTxData,
      value: 0,
      gasLimit: 50_000,
    };

    await ethRequestHandler({
      signer: pkpEthersWalletA,
      payload: {
        method: "eth_sendTransaction",
        params: [addAuthMethodTx],
      },
    });
    console.log(`✅ Added Lit Action Auth Method B to PKP`);

    console.log(
      "🔄 Getting PKP Session Sigs using Lit Action Auth Method B..."
    );
    const pkpSessionSigsB = await litNodeClient.getLitActionSessionSigs({
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
      litActionIpfsId: LIT_ACTION_CHECK_ADDRESS_B,
      jsParams: {
        authSig: JSON.stringify(
          await generateAuthSig({
            signer: ethersSignerB,
            // @ts-ignore
            toSign: await createSiweMessageWithRecaps({
              uri: "http://localhost",
              expiration: new Date(
                Date.now() + 1000 * 60 * 60 * 24
              ).toISOString(), // 24 hours
              walletAddress: ethersSignerB.address,
              nonce: await litNodeClient.getLatestBlockhash(),
              litNodeClient,
            }),
          })
        ),
      },
    });
    console.log("✅ Got PKP Session Sigs using Lit Action Auth Method B");

    const pkpEthersWalletB = new PKPEthersWallet({
      litNodeClient,
      pkpPubKey: mintedPkp.publicKey,
      controllerSessionSigs: pkpSessionSigsB,
    });
    await pkpEthersWalletB.init();

    console.log("🔄 Removing Lit Action Auth Method A from PKP...");
    const removeAuthMethodTxData =
      PKP_PERMISSIONS_ETHERS_CONTRACT.interface.encodeFunctionData(
        "removePermittedAction",
        [
          mintedPkp.tokenId,
          ethers.utils.toUtf8Bytes(LIT_ACTION_CHECK_ADDRESS_A),
        ]
      );

    const removeAuthMethodTx = {
      from: mintedPkp.ethAddress,
      to: PKP_PERMISSIONS_CONTRACT_ADDRESS,
      data: removeAuthMethodTxData,
      value: 0,
      gasLimit: 50_000,
    };

    await ethRequestHandler({
      signer: pkpEthersWalletB,
      payload: {
        method: "eth_sendTransaction",
        params: [removeAuthMethodTx],
      },
    });
    console.log(`✅ Removed Lit Action Auth Method B from PKP`);

    return mintedPkp;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
