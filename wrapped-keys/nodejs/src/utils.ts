import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LIT_NETWORK } from "@lit-protocol/constants";
import { LIT_NETWORKS_KEYS } from "@lit-protocol/types";
import fs from "fs";
export const getEnv = (name: string): string => {
  // print CWD
  console.log("CWD", process.cwd());
  // list files in CWD
  console.log("Files in CWD", fs.readdirSync(process.cwd()));

  // if .env file exists, read and print it
  if (fs.existsSync(".env")) {
    console.log("Contents of .env file:", fs.readFileSync(".env", "utf8"));
  }

  // Browser environment
  if (typeof globalThis !== "undefined" && "window" in globalThis) {
    const envMap: Record<string, string | undefined> = {
      ETHEREUM_PRIVATE_KEY: process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY,
      SOLANA_PRIVATE_KEY: process.env.NEXT_PUBLIC_SOLANA_PRIVATE_KEY,
    };
    const env = envMap[name];
    if (env === undefined || env === "")
      throw new Error(
        `Browser: ${name} ENV is not defined, please define it in the .env file`
      );
    return env;
  }

  // Node environment
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `Node: ${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

export const mintPkp = async (ethersSigner: ethers.Wallet) => {
  try {
    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LIT_NETWORK.DatilDev as LIT_NETWORKS_KEYS,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    console.log("🔄 Minting new PKP...");
    const pkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
    console.log(
      `✅ Minted new PKP with public key: ${pkp.publicKey} and ETH address: ${pkp.ethAddress}`
    );
    return pkp;
  } catch (error) {
    console.error(error);
  }
};
