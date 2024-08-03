import { ethers } from "ethers";
import fs from "fs";

import { datil, datilTest, datilDev } from "@lit-protocol/contracts";
import { add } from "@lit-protocol/contracts-sdk/src/lib/hex2dec";
import { LIT_NETWORK_VALUES } from "@lit-protocol/constants";

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

const getPaymentDelegationContext = (
  networkContext: typeof datil | typeof datilTest | typeof datilDev
) => {
  const contract = networkContext.data.find(
    (d) => d.name === "PaymentDelegation"
  )?.contracts[0];

  if (!contract) {
    throw new Error(`Contract not found in network context`);
  }

  return {
    address: contract.address_hash,
    abi: contract.ABI,
  };
};

const getRateLimitContext = (
  networkContext: typeof datil | typeof datilTest | typeof datilDev
) => {
  const contract = networkContext.data.find((d) => d.name === "RateLimitNFT")
    ?.contracts[0];

  if (!contract) {
    throw new Error(`Contract not found in network context`);
  }

  return {
    address: contract.address_hash,
    abi: contract.ABI,
  };
};

const PAYMENT_DB_BY_NETWORK: Record<
  LIT_NETWORK_VALUES,
  { address: string; abi: any }
> = {
  datil: {
    address: getPaymentDelegationContext(datil).address,
    abi: getPaymentDelegationContext(datil).abi,
  },
  "datil-test": {
    address: getPaymentDelegationContext(datilTest).address,
    abi: getPaymentDelegationContext(datilTest).abi,
  },
  "datil-dev": {
    address: getPaymentDelegationContext(datilDev).address,
    abi: getPaymentDelegationContext(datilDev).abi,
  },
} as const;

const RATE_LIMIT_BY_NETWORK: Record<
  LIT_NETWORK_VALUES,
  { address: string; abi: any }
> = {
  datil: {
    address: getRateLimitContext(datil).address,
    abi: getRateLimitContext(datil).abi,
  },
  "datil-test": {
    address: getRateLimitContext(datilTest).address,
    abi: getRateLimitContext(datilTest).abi,
  },
  "datil-dev": {
    address: getRateLimitContext(datilDev).address,
    abi: getRateLimitContext(datilDev).abi,
  },
} as const;

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

    const paymentDbContract = new ethers.Contract(
      PAYMENT_DB_BY_NETWORK[LIT_NETWORK].address,
      PAYMENT_DB_BY_NETWORK[LIT_NETWORK].abi,
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

    const rateLimitContract = new ethers.Contract(
      RATE_LIMIT_BY_NETWORK[LIT_NETWORK].address,
      RATE_LIMIT_BY_NETWORK[LIT_NETWORK].abi,
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
