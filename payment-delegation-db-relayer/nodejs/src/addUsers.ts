import { ethers } from "ethers";
import fs from "fs";

const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

const LIT_NETWORK = getEnv("LIT_NETWORK");
const LIT_RELAYER_URL = `https://${LIT_NETWORK}-relayer.getlit.dev/add-users`;
const LIT_RELAYER_API_KEY = getEnv("LIT_RELAYER_API_KEY");
const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const REQUESTS_PER_KILOSECOND = 1000000;

interface AddUserResponse {
  success: boolean;
  error?: string;
}

export const addUsers = async (users: string[]) => {
  // const headers = {
  //   "api-key": LIT_RELAYER_API_KEY,
  //   "payer-secret-key": LIT_PAYER_SECRET_KEY,
  //   "Content-Type": "application/json",
  // };

  try {
    console.log(`🔄 Adding ${users.length} users as delegatees...`);
    // const response = await fetch(LIT_RELAYER_URL, {
    //   method: "POST",
    //   headers: headers,
    //   body: JSON.stringify(users),
    // });

    // if (!response.ok) {
    //   throw new Error(`Error: ${await response.text()}`);
    // }

    // const data = (await response.json()) as AddUserResponse;
    // if (data.success !== true) {
    //   throw new Error(`Error: ${data.error}`);
    // }
    const provider = new ethers.providers.JsonRpcProvider(
      "https://yellowstone-rpc.litprotocol.com"
    );
    const wallet = new ethers.Wallet(ETHEREUM_PRIVATE_KEY, provider);

    const PaymentDbAbi = fs.readFileSync(
      "./src/abis/PaymentDelegation.abi",
      "utf-8"
    );
    const paymentDbContract = new ethers.Contract(
      "0xd7188e0348F1dA8c9b3d6e614844cbA22329B99E",
      PaymentDbAbi,
      wallet
    );

    // delegate payment for users
    const addPayerTx = await paymentDbContract.delegatePaymentsBatch(users);
    await addPayerTx.wait();
    console.log("✅ Added users as delegatees");

    console.log(`🔄 Setting restriction...`);
    const addRestrictionTx = await paymentDbContract.setRestriction([
      1000000000, 86400,
    ]);
    await addRestrictionTx.wait();
    console.log("✅ Added restriction");

    console.log(`🔄 Minting a rate limit NFT`);
    const rateLimitAbi = fs.readFileSync(
      "./src/abis/RateLimitNFT.abi",
      "utf-8"
    );
    const rateLimitContract = new ethers.Contract(
      "0xa17f11B7f828EEc97926E56D98D5AB63A0231b77",
      rateLimitAbi,
      wallet
    );

    // pick an expiration time of midnight 28 days into the future
    const now = new Date();
    const expirationDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 28,
        0,
        0,
        0
      )
    );
    const expirationTime = Math.floor(expirationDate.getTime() / 1000);
    const cost = await rateLimitContract.calculateCost(
      REQUESTS_PER_KILOSECOND,
      expirationTime
    );
    const mintRateLimitTx = await rateLimitContract.mint(expirationTime, {
      value: cost,
    });
    await mintRateLimitTx.wait();
    console.log("✅ Minted rate limit NFT");

    return true;
  } catch (error) {
    console.error("Error registering payer:", error);
    throw error;
  }
};
