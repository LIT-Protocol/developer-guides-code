import ethers from "ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  AuthMethodScope,
  LitNetwork,
  ProviderType,
} from "@lit-protocol/constants";
import {
  EthWalletProvider,
  LitAuthClient,
} from "@lit-protocol/lit-auth-client";
import { api, EthereumLitTransaction } from "@lit-protocol/wrapped-keys";

const { importPrivateKey, signTransactionWithEncryptedKey } = api;

import { getEnv } from "./utils";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";

const LIT_RELAYER_API_KEY = getEnv("LIT_RELAYER_API_KEY");
const FUNDING_WALLET_PRIVATE_KEY = getEnv("FUNDING_WALLET_PRIVATE_KEY");

export const doTheThing = async () => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Generating a wallet for the user...");
    let userEthersSigner = ethers.Wallet.createRandom();
    userEthersSigner = userEthersSigner.connect(
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );
    console.log(`✅ Created the Ethereum wallet: ${userEthersSigner.address}`);

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    console.log("🔄 Initializing a Lit Auth client...");
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: LIT_RELAYER_API_KEY,
      },
      litNodeClient,
    });
    console.log("✅ Initialized a Lit Auth client");

    console.log("🔄 Initializing Lit Auth EthWallet provider...");
    const userAuthProvider = litAuthClient.initProvider(ProviderType.EthWallet);
    console.log("✅ Initialized Lit Auth EthWallet provider");

    console.log("🔄 Authenticating Lit Auth EthWallet provider...");
    const userAuthMethod = await EthWalletProvider.authenticate({
      signer: userEthersSigner,
      litNodeClient,
    });
    console.log("✅ Authenticated Lit Auth EthWallet provider");

    console.log("🔄 Minting PKP via Relayer...");
    const mintedPkpTransactionHash =
      await userAuthProvider.mintPKPThroughRelayer(userAuthMethod, {
        permittedAuthMethodScopes: [[AuthMethodScope.SignAnything]],
      });
    console.log(
      `✅ Minted PKP via Relayer. Transaction hash: ${mintedPkpTransactionHash}`
    );

    console.log("🔄 Fetching PKPs for user wallet...");
    const pkps = await userAuthProvider.fetchPKPsThroughRelayer(userAuthMethod);
    console.log(`✅ Fetched ${pkps.length} PKP(s) for user wallet`);

    console.log("🔄 Generating PKP Session Signatures with the user's PKP...");
    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: pkps[0].publicKey,
      authMethods: [
        await EthWalletProvider.authenticate({
          signer: userEthersSigner,
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
    console.log("✅ Generated PKP Session Signatures");

    console.log("🔄 Importing user's private key as a Lit Wrapped Key...");
    const pkpAddress = await importPrivateKey({
      pkpSessionSigs,
      litNodeClient,
      privateKey: userEthersSigner.privateKey,
      publicKey: pkps[0].publicKey,
      keyType: "K256",
    });
    console.log(
      `✅ Imported private key, and attached to PKP with address: ${pkpAddress}`
    );

    console.log("🔄 Funding user's Ethereum address on Chronicle...");
    const fundingAmount = "0.0000001";
    const fundingEthersSigner = new ethers.Wallet(
      FUNDING_WALLET_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );
    const txResponse = await fundingEthersSigner.sendTransaction({
      to: pkpAddress,
      value: ethers.utils.parseUnits(fundingAmount, "ether"),
    });
    await txResponse.wait();
    console.log(`✅ Funded ${pkpAddress} with ${fundingAmount} ether`);

    console.log("🔄 Signing and sending a transaction with Wrapped Key...");
    const transferAmount = "0.0000000001";
    const unsignedTransaction: EthereumLitTransaction = {
      chainId: 2311,
      chain: "datilDevnet",
      toAddress: fundingEthersSigner.address,
      value: transferAmount,
      gasLimit: 21_000,
    };

    const signedTransactionHash = await signTransactionWithEncryptedKey({
      pkpSessionSigs,
      network: "evm",
      unsignedTransaction,
      broadcast: true,
      litNodeClient,
    });
    console.log(
      `✅ Signed and sent transaction. Transaction hash: ${signedTransactionHash}`
    );
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};

await doTheThing();
