import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, AuthMethodScope, METAMASK_CHAIN_INFO_BY_NETWORK } from "@lit-protocol/constants";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { providers } from "ethers";
import Hash from "typestub-ipfs-only-hash";
import { SessionSigsMap, AuthSig } from "@lit-protocol/types";
import { ethers } from "ethers";

// -- helper functions
const loggedKeys = new Set<string>();

function checkLocalStorage() {
  const localStorageKeys = Object.keys(localStorage);
  const newKeys = localStorageKeys.filter(key => !loggedKeys.has(key));

  if (newKeys.length > 0) {
    console.log(`   💾 New Local Storage Keys: ${newKeys.join(', ')}`);
    newKeys.forEach(key => loggedKeys.add(key));
  }
}

// -- types
interface Params {
  SELECTED_NETWORK: keyof typeof LIT_NETWORK,
  DEBUG: boolean;
}

interface TestReturn {
  sessionSigs: SessionSigsMap;
  pkp: {
    tokenId: any;
    publicKey: string;
    ethAddress: string;
  };
  capacityTokenId: string;
  capacityDelegationAuthSig: AuthSig;
  ipfsCid: string;
  permitTx: any;
}

export async function testGetLitActionSessionSigs(params: Params): Promise<TestReturn> {
  // -- prepare params
  console.log("---------- Required Params ----------");
  console.log(`✅ SELECTED_NETWORK: ${params.SELECTED_NETWORK}`);

  if (!params.SELECTED_NETWORK) {
    console.error("❌ Error: SELECTED_NETWORK is missing.");
    return Promise.reject("SELECTED_NETWORK is missing.");
  }

  let litNodeClient: LitNodeClient;
  let sessionSigs: SessionSigsMap;
  let pkp: {
    tokenId: any;
    publicKey: string;
    ethAddress: string;
  };
  let capacityTokenId: string;
  let capacityDelegationAuthSig: AuthSig;
  let ipfsCid: string;
  let permitTx: any;

  // -- start
  console.log("---------- GO! ----------");
  try {

    // -- Request user to connect their wallet and switch network if needed
    const provider = new providers.Web3Provider((window as any).ethereum);
    await provider.send("eth_requestAccounts", []);

    // Check current network and switch if necessary
    const network = await provider.getNetwork();
    if (network.chainId !== METAMASK_CHAIN_INFO_BY_NETWORK[params.SELECTED_NETWORK].chainId) {
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: ethers.utils.hexValue(METAMASK_CHAIN_INFO_BY_NETWORK[params.SELECTED_NETWORK].chainId) }]);
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await provider.send("wallet_addEthereumChain", [METAMASK_CHAIN_INFO_BY_NETWORK[params.SELECTED_NETWORK]]);
        } else {
          throw switchError;
        }
      }
    }

    const signer = provider.getSigner();
    const address = await signer.getAddress();
    console.log(`   ✅ Wallet connected: ${address}`);
    console.log(`     - Network: ${await provider.getNetwork()}`);
    console.log(`     - Address: ${address}`);
    console.log(`     - Balance: ${ethers.utils.formatEther(await signer.getBalance())} ETH`);
    checkLocalStorage();

    // -- 
    console.log(`2. 🔄 Connecting LitNodeClient...`);
    litNodeClient = new LitNodeClient({
      litNetwork: params.SELECTED_NETWORK as any,
      debug: params.DEBUG,
    });
    await litNodeClient.connect();
    console.log(`   ✅ LitNodeClient successfully connected.`);
    checkLocalStorage();

    // -- 
    console.log(`3. 🔄 Connecting LitContracts...`);
    const litContracts = new LitContracts({
      signer: signer,
      network: params.SELECTED_NETWORK as any,
      debug: params.DEBUG,
    });
    await litContracts.connect();
    console.log(`   ✅ LitContracts successfully connected.`);
    checkLocalStorage();

    // --
    console.log(`4. 🔄 Minting new PKP`);
    const pkpMintRes = await litContracts.pkpNftContractUtils.write.mint();
    pkp = pkpMintRes.pkp;
    console.log(`   ✅ PKP minted:`);
    console.log(`     - Token ID: ${pkp.tokenId}`);
    console.log(`     - Public Key: ${pkp.publicKey}`);
    console.log(`     - ETH Address: ${pkp.ethAddress}`);
    checkLocalStorage();

    // -- 
    console.log(`5. 🔄 Minting Capacity Credits NFT... (Datil feature. Deprecated in Naga)`);
    capacityTokenId = (
      await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 1,
      })
    ).capacityTokenIdStr;
    console.log(`   ✅ Minted new Capacity Credits NFT:`);
    console.log(`     - Token ID: ${capacityTokenId}`);
    console.log(`     - Requests Per Kilosecond: 10`);
    console.log(`     - Expiration: 1 day`);
    checkLocalStorage();

    // --
    console.log(`6. 🔄 Creating Capacity Delegation AuthSig...`);
    const authSigResponse = await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: signer,
      capacityTokenId,
      delegateeAddresses: [pkp.ethAddress],
      uses: "1",
    });
    capacityDelegationAuthSig = authSigResponse.capacityDelegationAuthSig;
    console.log(`   ✅ Capacity Delegation AuthSig created:`);
    console.log(`     - AuthSig: ${capacityDelegationAuthSig}`);
    console.log(`     - Uses: 1`);
    console.log(`     - Delegatee Address: ${pkp.ethAddress}`);
    console.log(`     - Capacity Token ID: ${capacityTokenId}`);
    checkLocalStorage();

    // 
    console.log(`7. 🔄 Using example Lit Action...`);
    const litActionCode = `(() => {
      if (magicNumber >= 42) {
          LitActions.setResponse({ response:"true" });
      } else {
          LitActions.setResponse({ response: "false" });
      }
  })();`;
    console.log(`   ✅ Lit Action code:`);
    console.log(`     - ${litActionCode}`);
    checkLocalStorage();

    // 
    console.log(`8. 🔄 Generating IPFS CID from Lit Action code`);
    ipfsCid = await Hash.of(litActionCode);
    console.log(`   ✅ IPFS CID: ${ipfsCid}`);
    checkLocalStorage();

    // 
    console.log(`9. 🔄 Permit Lit Action to use the PKP`);
    permitTx = await litContracts.addPermittedAction({
      ipfsId: ipfsCid,
      pkpTokenId: pkp.tokenId,
      authMethodScopes: [AuthMethodScope.SignAnything]
    });
    console.log(`   ✅ Example Lit Action has permission to use PKP:`);
    console.log(`     - Transaction hash: https://yellowstone-explorer.litprotocol.com/tx/${permitTx.transactionHash}`);
    console.log(`     - IPFS CID: ${ipfsCid}`);
    console.log(`     - PKP Token ID: ${pkp.tokenId}`);
    console.log(`     - Auth Method Scopes: [SignAnything]`);
    checkLocalStorage();

    // 
    console.log(`10. 🔄 Creating Lit Action Session...`);
    sessionSigs = await litNodeClient.getLitActionSessionSigs({
      // 20 seconds from now in ISO format
      // expiration: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
      expiration: new Date(Date.now() + 20 * 1000).toISOString(),
      pkpPublicKey: pkp.publicKey,
      capabilityAuthSigs: [capacityDelegationAuthSig],
      chain: "ethereum",
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
      litActionCode: Buffer.from(litActionCode).toString("base64"),
      jsParams: {
        magicNumber: 42,
      },
    });
    console.log(`   ✅ Lit Action Session Sigs:`);
    console.log(sessionSigs);
    checkLocalStorage();

    // 
    console.log(`11. 🔄 Using the sessionSigs to executeJs`);
    const response = await litNodeClient.executeJs({
      code: `(() => {
      if (magicNumber >= 42) {
          LitActions.setResponse({ response:"true" });
      } else {
          LitActions.setResponse({ response: "false" });
      }
  })();`,
      sessionSigs,
      jsParams: {
        magicNumber: 42,
      },
    });
    console.log(`   ✅ Lit Action Response:`);
    console.log(response);


  } catch (e) {
    console.error("❌ Error:", e);
  }

  return {
    sessionSigs: sessionSigs!,
    pkp: pkp!,
    capacityTokenId: capacityTokenId!,
    capacityDelegationAuthSig: capacityDelegationAuthSig!,
    ipfsCid: ipfsCid!,
    permitTx,
  }

}
