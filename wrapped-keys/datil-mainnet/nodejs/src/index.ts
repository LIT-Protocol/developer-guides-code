import { ethers } from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import {
  api,
  SignTransactionWithEncryptedKeyParams,
} from "@lit-protocol/wrapped-keys";

const { generatePrivateKey, signTransactionWithEncryptedKey } = api;

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const runExample = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Datil,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.Datil,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    console.log("🔄 Minting new PKP...");
    const mintedPkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
    console.log(
      `✅ Minted new PKP with public key: ${mintedPkp.publicKey} and ETH address: ${mintedPkp.ethAddress}`
    );

    console.log("🔄 Minting a Capacity Credit...");
    const capacityTokenId = (
      await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 1,
      })
    ).capacityTokenIdStr;
    console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);

    console.log("🔄 Creating Capacity Delegation Auth Sig for PKP...");
    let { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersSigner,
        capacityTokenId,
        delegateeAddresses: [mintedPkp.ethAddress],
        uses: "2",
      });
    console.log("✅ Capacity Delegation Auth Sig created");

    console.log("🔄 Getting PKP Session Sigs...");
    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: mintedPkp.publicKey,
      capabilityAuthSigs: [capacityDelegationAuthSig],
      authMethods: [
        await EthWalletProvider.authenticate({
          signer: ethersSigner,
          litNodeClient,
          expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        }),
      ],
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
    console.log("✅ Got PKP Session Sigs");

    console.log("🔄 Generating wrapped key...");
    const wrappedKey = await generatePrivateKey({
      pkpSessionSigs,
      network: "evm",
      memo: "This can be any string you'd like",
      litNodeClient,
    });
    console.log(
      `✅ Generated wrapped key with id: ${wrappedKey.id} and public key: ${wrappedKey.generatedPublicKey}`
    );

    const transferAmount = ethers.utils.parseEther("0.001");
    const wrappedKeyEthAddress = ethers.utils.computeAddress(
      wrappedKey.generatedPublicKey
    );
    console.log(
      `🔄 Using ${
        ethersSigner.address
      } to fund ${wrappedKeyEthAddress} (the Wrapped Key) with ${ethers.utils.formatEther(
        transferAmount
      )} ether for transfer...`
    );
    const txResponse = await ethersSigner.sendTransaction({
      to: wrappedKeyEthAddress,
      value: transferAmount,
    });
    txResponse.wait();
    console.log(`✅ Funded Wrapped Key tx hash: ${txResponse.hash}`);

    console.log(
      "🔄 Signing and sending transaction with Wrapped Key on Chronicle Yellowstone blockchain..."
    );
    const transactionHash = await signTransactionWithEncryptedKey({
      pkpSessionSigs,
      network: "evm",
      id: wrappedKey.id,
      unsignedTransaction: {
        chainId: 175188,
        chain: "yellowstone",
        toAddress: ethersSigner.address,
        value: "0.0001",
        gasLimit: 21_000,
      },
      broadcast: true,
      litNodeClient,
    } as SignTransactionWithEncryptedKeyParams);
    console.log(`✅ Signed and sent transaction. Tx hash: ${transactionHash}`);
    return transactionHash;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
