import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LIT_ABILITY, LIT_NETWORK } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import * as ethers from "ethers";
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";

import TestTokenArtifact from "../artifacts/contracts/TestToken.sol/TestToken.json";

export async function pkpWallet() {
  let litNodeClient: LitNodeClient;

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const ethersSigner = provider.getSigner();
  console.log("Connected account:", await ethersSigner.getAddress());
  try {
    console.log("🔄 Connecting to the Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to the Lit network");

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      network: LIT_NETWORK.DatilDev,
      debug: false,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    const userTokens = await litContracts.pkpNftContractUtils.read.getTokensInfoByAddress(await ethersSigner.getAddress());
    
    if (!userTokens || userTokens.length === 0) {
      console.error("No PKP tokens found for this address");
      return;
    }

    console.log("Found PKP tokens:", userTokens);
    const pkp = userTokens[0];

    console.log("PKP Details:");
    console.log("- Public Key:", pkp.publicKey);
    console.log("- Computed Address:", pkp.ethAddress);

    console.log("🔄 Getting Session Sigs via an Auth Sig...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LIT_ABILITY.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LIT_ABILITY.LitActionExecution,
        },
      ],
      authNeededCallback: async ({
        resourceAbilityRequests,
        expiration,
        uri,
      }) => {
        const toSign = await createSiweMessageWithRecaps({
          uri: uri!,
          expiration: expiration!,
          resources: resourceAbilityRequests!,
          walletAddress: await ethersSigner.getAddress(),
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });
    console.log("✅ Got Session Sigs via an Auth Sig");

    const pkpEthersWallet = new PKPEthersWallet({
      pkpPubKey: pkp.publicKey!,
      controllerSessionSigs: sessionSigs,
      debug: false,
      litNodeClient,
    });

    const walletAddress = await pkpEthersWallet.getAddress();
    const ethBalance = await pkpEthersWallet.getBalance();
    const nonce = await pkpEthersWallet.getTransactionCount();

    console.log("PKP Wallet Address:", walletAddress);
    console.log("ETH Balance:", ethers.utils.formatEther(ethBalance));
    console.log("Nonce:", nonce);

    try {
      const savedContract = localStorage.getItem("testTokenContract");
      let contract;

      if (savedContract) {
        try {
          const contractData = JSON.parse(savedContract);
          console.log("Found saved contract data:", contractData);

          const provider = new ethers.providers.JsonRpcProvider(
            LIT_RPC.CHRONICLE_YELLOWSTONE
          );
          const code = await provider.getCode(contractData.address);

          if (code !== "0x") {
            console.log("Loading existing contract...");
            contract = new ethers.Contract(
              contractData.address,
              TestTokenArtifact.abi,
              pkpEthersWallet
            );
            console.log("Contract loaded from:", contractData.address);
          } else {
            console.log(
              "Saved contract not found on chain, deploying new one..."
            );
            localStorage.removeItem("testTokenContract");
          }
        } catch (e) {
          console.error("Error loading saved contract:", e);
          localStorage.removeItem("testTokenContract");
        }
      }

      if (!contract) {
        console.log("Starting new contract deployment...");
        const factory = new ethers.ContractFactory(
          TestTokenArtifact.abi,
          TestTokenArtifact.bytecode,
          pkpEthersWallet
        );

        const gasPrice = await pkpEthersWallet.getGasPrice();
        console.log(
          "Current gas price:",
          ethers.utils.formatUnits(gasPrice, "gwei"),
          "gwei"
        );

        contract = await factory.deploy({
          gasLimit: 3000000,
          gasPrice: gasPrice,
        });

        await contract.deployed();
        console.log("TestToken deployed to:", contract.address);

        console.log("Writing initial message...");
        const tx = await contract.writeMessage("Hello from new deployment!");
        await tx.wait();

        localStorage.setItem(
          "testTokenContract",
          JSON.stringify({
            address: contract.address,
            deployedAt: new Date().toISOString(),
          })
        );
      }

      const currentMessage = await contract.readMyMessage({
        blockTag: "latest",
      });
      console.log("Current message:", currentMessage);

      return;
    } catch (err) {
      console.error("Contract interaction failed:", err);
    }

    return;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
}
