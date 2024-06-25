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
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import bs58 from "bs58";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY_A = getEnv("ETHEREUM_PRIVATE_KEY_A");
const ETHEREUM_PRIVATE_KEY_B = getEnv("ETHEREUM_PRIVATE_KEY_B");
const LIT_ACTION_CHECK_ADDRESS_A = getEnv("LIT_ACTION_CHECK_ADDRESS_A");
const LIT_ACTION_CHECK_ADDRESS_B = getEnv("LIT_ACTION_CHECK_ADDRESS_B");
const LIT_ACTION_A_IPFS_CID_BYTES = `0x${Buffer.from(
  bs58.decode(LIT_ACTION_CHECK_ADDRESS_A)
).toString("hex")}`;
const LIT_ACTION_B_IPFS_CID_BYTES = `0x${Buffer.from(
  bs58.decode(LIT_ACTION_CHECK_ADDRESS_B)
).toString("hex")}`;

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
      debug: false,
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

    console.log("🔄 Checking Lit Action Auth Method A permitted for PKP...");
    const isPermittedA =
      await litContracts.pkpPermissionsContract.read.isPermittedAction(
        mintedPkp.tokenId,
        LIT_ACTION_A_IPFS_CID_BYTES
      );
    if (!isPermittedA)
      throw new Error("Lit Action Auth Method A is not permitted for the PKP");
    console.log("✅ Lit Action Auth Method A is permitted for PKP");

    console.log("🔄 Transferring ownership of PKP to itself...");
    const transferPkpOwnershipReceipt = await (
      await litContracts.pkpNftContract.write.transferFrom(
        ethersSignerA.address,
        mintedPkp.ethAddress,
        mintedPkp.tokenId,
        {
          gasLimit: 125_000,
        }
      )
    ).wait();
    console.log(
      `✅ Transferred ownership of PKP NFT. Transaction hash: ${transferPkpOwnershipReceipt.transactionHash}`
    );

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Cayenne,
      debug: false,
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
        value: ethers.utils.parseEther("0.0001"),
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

    console.log(
      "🔄 Connecting litContracts client with pkpEthersWalletA to network..."
    );
    const litContractsPkpSignerA = new LitContracts({
      signer: pkpEthersWalletA,
      network: LitNetwork.Cayenne,
      debug: false,
    });
    await litContractsPkpSignerA.connect();
    console.log(
      "✅ Connected litContracts client with pkpEthersWalletA to network"
    );

    console.log("🔄 Adding Lit Action Auth Method B to PKP...");
    const addAuthMethodBReceipt = await (
      await litContractsPkpSignerA.pkpPermissionsContract.write.addPermittedAction(
        mintedPkp.tokenId,
        LIT_ACTION_B_IPFS_CID_BYTES,
        [AuthMethodScope.SignAnything],
        {
          gasPrice: await ethersSignerA.provider.getGasPrice(),
          gasLimit: 250_000,
        }
      )
    ).wait();
    console.log(
      `✅ Added Lit Action Auth Method B to PKP. Transaction hash: ${addAuthMethodBReceipt.transactionHash}`
    );

    console.log("🔄 Checking Lit Action Auth Method B permitted for PKP...");
    const isPermittedB =
      await litContracts.pkpPermissionsContract.read.isPermittedAction(
        mintedPkp.tokenId,
        LIT_ACTION_B_IPFS_CID_BYTES
      );
    if (!isPermittedB)
      throw new Error("Lit Action Auth Method B is not permitted for the PKP");
    console.log("✅ Lit Action Auth Method B is permitted for PKP");

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

    console.log(
      "🔄 Connecting litContracts client with pkpEthersWalletB to network..."
    );
    const litContractsPkpSignerB = new LitContracts({
      signer: pkpEthersWalletB,
      network: LitNetwork.Cayenne,
      debug: false,
    });
    await litContractsPkpSignerB.connect();
    console.log(
      "✅ Connected litContracts client with pkpEthersWalletB to network"
    );

    console.log("🔄 Removing Lit Action Auth Method A from PKP...");
    const removeAuthMethodAReceipt = await (
      await litContractsPkpSignerB.pkpPermissionsContract.write.removePermittedAction(
        mintedPkp.tokenId,
        LIT_ACTION_A_IPFS_CID_BYTES,
        {
          gasPrice: await ethersSignerA.provider.getGasPrice(),
          gasLimit: 100_000,
        }
      )
    ).wait();
    console.log(
      `✅ Removed Lit Action Auth Method B from PKP. Transaction hash: ${removeAuthMethodAReceipt.transactionHash}`
    );

    return mintedPkp;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
