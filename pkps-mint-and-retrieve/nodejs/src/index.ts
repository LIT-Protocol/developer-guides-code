import bs58 from "bs58";
import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  AuthMethodScope,
  AuthMethodType,
  LitNetwork,
} from "@lit-protocol/constants";
import {
  EthWalletProvider,
  LitAuthClient,
} from "@lit-protocol/lit-auth-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const LIT_ACTION_CHECK_ADDRESS = getEnv("LIT_ACTION_CHECK_ADDRESS");
const LIT_ACTION_IPFS_CID_BYTES = `0x${Buffer.from(
  bs58.decode(LIT_ACTION_CHECK_ADDRESS)
).toString("hex")}`;

export const runTheExample = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

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
    const addAuthMethodAReceipt = await litContracts.addPermittedAction({
      pkpTokenId: mintedPkp.tokenId,
      ipfsId: LIT_ACTION_CHECK_ADDRESS,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });
    console.log(
      `✅ Added Lit Action Auth Method to PKP. Transaction hash: ${addAuthMethodAReceipt.transactionHash}`
    );

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Cayenne,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    const authMethod = await EthWalletProvider.authenticate({
      signer: ethersSigner,
      litNodeClient,
    });

    console.log("🔄 Getting PKP token IDs for Auth Method...");
    const pkpIds =
      await litContracts.pkpPermissionsContract.read.getTokenIdsForAuthMethod(
        AuthMethodType.EthWallet,
        await LitAuthClient.getAuthIdByAuthMethod(authMethod)
      );
    console.log(`✅ Got PKP token IDs for Auth Method: ${pkpIds}`);

    // console.log("🔄 Getting PKP token IDs for Auth Method...");
    // const pkpIds2 =
    //   await litContracts.pkpPermissionsContract.read.getTokenIdsForAuthMethod(
    //     AuthMethodType.LitAction,
    //     LIT_ACTION_IPFS_CID_BYTES
    //   );
    // console.log(`✅ Got PKP token IDs for Auth Method: ${pkpIds2}`);
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
