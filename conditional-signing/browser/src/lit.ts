import { ethers } from "ethers";
import { disconnectWeb3, LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";

const DEFAULT_PKP_PUBLIC_KEY =
  "043f21d4c0d2041d3952428fe6d6d7858df40b234cb235ea7a31394beb9062d5ea7be4a622b35a67063a1e5ff51770da5fc10e47793dedc8bd7534822680791c8b";

const litActionCode = `
(async () => {
  // test an access control condition
  const testResult = await Lit.Actions.checkConditions({
    conditions,
    authSig,
    chain,
  });

  if (!testResult) {
    LitActions.setResponse({ response: "address does not have 1 or more Wei on Ethereum Mainnet" });
    return
  }

  const sigShare = await LitActions.signEcdsa({
    toSign: dataToSign,
    publicKey,
    sigName: "sig",
  });
})();
`;

export const runExample = async (
  pkpPublicKey: string = DEFAULT_PKP_PUBLIC_KEY
) => {
  let litNodeClient: LitNodeClient;

  try {
    console.log("🔄 Connecting to wallet...");
    disconnectWeb3();
    if (typeof window.ethereum === "undefined") {
      throw new Error("❌ Browser wallet extension not installed");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    const ethersSigner = ethersProvider.getSigner();
    const connectedAddress = await ethersSigner.getAddress();
    console.log(`✅ Connected to wallet: ${connectedAddress}`);

    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilTest,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    let _pkpPublicKey = pkpPublicKey;
    if (pkpPublicKey === undefined) {
      console.log("🔄 No PKP provided, minting a new one...");
      const litContracts = new LitContracts({
        signer: ethersSigner,
        network: LitNetwork.DatilDev,
      });

      await litContracts.connect();

      _pkpPublicKey = await (
        await litContracts.pkpNftContractUtils.write.mint()
      ).pkp.publicKey;
      console.log(`✅ Minted new PKP: ${_pkpPublicKey}`);
    }

    console.log("🔄 Getting Auth Sig...");
    const toSign = await createSiweMessageWithRecaps({
      uri: "http://localhost",
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours,
      resources: [
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      walletAddress: connectedAddress,
      nonce: await litNodeClient.getLatestBlockhash(),
      litNodeClient,
    });

    const authSig = await generateAuthSig({
      signer: ethersSigner,
      toSign,
    });
    console.log("✅ Got Auth Sig");

    console.log("🔄 Getting PKP signature via Lit Action...");
    const litActionSignatures = await litNodeClient.executeJs({
      sessionSigs: await litNodeClient.getSessionSigs({
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
        authNeededCallback: async ({
          resourceAbilityRequests,
          expiration,
          uri,
        }) => {
          const toSign = await createSiweMessageWithRecaps({
            uri: uri!,
            expiration: expiration!,
            resources: resourceAbilityRequests!,
            walletAddress: connectedAddress,
            nonce: await litNodeClient.getLatestBlockhash(),
            litNodeClient,
          });

          return await generateAuthSig({
            signer: ethersSigner,
            toSign,
          });
        },
      }),
      code: litActionCode,
      jsParams: {
        conditions: [
          {
            conditionType: "evmBasic",
            contractAddress: "",
            standardContractType: "",
            chain: "ethereum",
            method: "eth_getBalance",
            parameters: [":userAddress", "latest"],
            // You'd probably want to update this to >= 1 or similar
            returnValueTest: {
              comparator: "=",
              value: "0",
            },
          },
        ],
        authSig,
        chain: "ethereum",
        dataToSign: ethers.utils.arrayify(
          ethers.utils.keccak256([1, 2, 3, 4, 5])
        ),
        publicKey: _pkpPublicKey,
      },
    });
    console.log("✅ Got PKP signature", litActionSignatures);
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
