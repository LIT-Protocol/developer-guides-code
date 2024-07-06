import ethers from "ethers";

import { getEnv } from "./utils";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LIT_NETWORKS_KEYS } from "@lit-protocol/types";
import { writeFileSync } from "fs";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const LIT_FROM_NETWORK = getEnv("LIT_FROM_NETWORK");
const LIT_TO_NETWORK = getEnv("LIT_TO_NETWORK");
const ADD_PKP_ETH_ADDRESS_AS_PERMITTED_ADDRESS = Boolean(
  getEnv("ADD_PKP_ETH_ADDRESS_AS_PERMITTED_ADDRESS")
);
const SEND_PKP_TO_ITSELF = Boolean(getEnv("SEND_PKP_TO_ITSELF"));

interface AuthMethod {
  authMethodType: ethers.BigNumber;
  id: string;
  userPubkey: string;
}

interface AuthMethodWithScopes extends AuthMethod {
  scopes: boolean[];
}

interface PKPData {
  authMethodsWithScopes: AuthMethodWithScopes[];
  metadata: {
    ethAddress: string;
    tokenId: string;
  };
}

interface PKPsWithData {
  [pkp: string]: PKPData;
}

interface NewPKP {
  newPkp: string;
  txHash: string;
  newPkpTokenId: string;
  newPkpEthAddress: string;
  oldPkpEthAddress: string;
  oldPkpTokenId: string;
}

export interface NewPKPs {
  [pkp: string]: NewPKP;
}

export const migratePkps = async (
  pkpsToMigrate: string[],
  newPkpsFilePath: string
) => {
  try {
    console.log(
      `🔄 Connecting LitContracts client to ${LIT_FROM_NETWORK} network...`
    );
    const litContractsClientFromNetwork = new LitContracts({
      network: LIT_FROM_NETWORK as LIT_NETWORKS_KEYS,
    });
    await litContractsClientFromNetwork.connect();
    console.log(
      `✅ Connected LitContracts client to ${LIT_FROM_NETWORK} network...`
    );

    console.log(`🔄 Fetching data for ${pkpsToMigrate.length} PKPs...`);
    const pkpsWithData: PKPsWithData = {};
    for (const pkp of pkpsToMigrate) {
      // convert PKP Public Key to tokenId
      const tokenId = ethers.utils.keccak256("0x" + pkp);

      const authMethods =
        await litContractsClientFromNetwork.pkpPermissionsContract.read.getPermittedAuthMethods(
          tokenId
        );

      const ethAddress =
        await litContractsClientFromNetwork.pkpNftContract.read.getEthAddress(
          tokenId
        );

      // for each auth method, also get the scopes for it
      const authMethodsWithScopes: AuthMethodWithScopes[] = [];
      for (let authMethod of authMethods) {
        const scopes =
          await litContractsClientFromNetwork.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
            tokenId,
            authMethod.authMethodType,
            authMethod.id,
            100
          );
        authMethodsWithScopes.push({ ...authMethod, scopes });
      }
      pkpsWithData[pkp] = {
        authMethodsWithScopes,
        metadata: { ethAddress, tokenId },
      };
    }
    console.log(`✅ Fetched data for ${pkpsToMigrate.length} PKPs...`);

    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    console.log(
      `🔄 Connecting LitContracts client to ${LIT_TO_NETWORK} network...`
    );
    const litContractsClientToNetwork = new LitContracts({
      signer: ethersSigner,
      network: LIT_TO_NETWORK as LIT_NETWORKS_KEYS,
    });
    await litContractsClientToNetwork.connect();
    console.log(
      `✅ Connected LitContracts client to ${LIT_TO_NETWORK} network...`
    );

    console.log(
      `🔄 Minting ${pkpsToMigrate.length} new PKPs with matching Auth Methods and Scopes...`
    );
    const pkpMintCost =
      await litContractsClientToNetwork.pkpNftContract.read.mintCost();
    const newPkps: NewPKPs = {};

    let pkpMintedCounter = 0;
    for (const pkp of Object.keys(pkpsWithData)) {
      const authMethodsWithScopes = pkpsWithData[pkp].authMethodsWithScopes;
      const authMethodTypes = authMethodsWithScopes.map(
        (authMethod) => authMethod.authMethodType
      );
      const authIds = authMethodsWithScopes.map((authMethod) => authMethod.id);
      const userPubkeys = authMethodsWithScopes.map(
        (authMethod) => authMethod.userPubkey
      );
      const scopes = authMethodsWithScopes.map((authMethod) =>
        authMethod.scopes
          .map((scope, idx) => (scope ? idx : null))
          .filter((scope) => scope !== null)
      );

      const tx =
        await litContractsClientToNetwork.pkpHelperContract.write.mintNextAndAddAuthMethods(
          2,
          authMethodTypes,
          authIds,
          userPubkeys,
          scopes,
          ADD_PKP_ETH_ADDRESS_AS_PERMITTED_ADDRESS,
          SEND_PKP_TO_ITSELF,
          { value: pkpMintCost }
        );
      const receipt = await tx.wait();

      ++pkpMintedCounter;
      console.log(
        `ℹ️  Minted ${pkpMintedCounter} of ${
          Object.keys(pkpsWithData).length
        } with tx ${receipt.transactionHash}`
      );

      // Find the new PKP public key
      const pkpMintedEvent = receipt!.events!.find(
        (event) =>
          event.topics[0] ===
          "0x3b2cc0657d0387a736293d66389f78e4c8025e413c7a1ee67b7707d4418c46b8"
      );
      const newPkp = "0x" + pkpMintedEvent!.data.slice(130, 260);

      const newPkpTokenId = ethers.utils.keccak256(newPkp);
      const newPkpEthAddress =
        await litContractsClientToNetwork.pkpNftContract.read.getEthAddress(
          newPkpTokenId
        );

      // console.log(`receipt: ${JSON.stringify(receipt, null, 2)}`);
      newPkps[pkp] = {
        newPkp,
        txHash: receipt.transactionHash,
        newPkpTokenId,
        newPkpEthAddress,
        oldPkpEthAddress: pkpsWithData[pkp].metadata.ethAddress,
        oldPkpTokenId: pkpsWithData[pkp].metadata.tokenId,
      };
    }
    console.log(
      `✅ Minted ${pkpsToMigrate.length} new PKPs with matching Auth Methods and Scopes`
    );

    console.log(`🔄 Writing new PKP metadata to: ${newPkpsFilePath}`);
    writeFileSync(newPkpsFilePath, JSON.stringify(newPkps, null, 2));
    console.log(
      `✅ Wrote ${pkpMintedCounter} PKP metadata to: ${newPkpsFilePath}`
    );
  } catch (error) {
    console.error(error);
  } finally {
  }
};
