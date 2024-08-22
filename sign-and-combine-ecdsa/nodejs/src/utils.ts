import { LIT_CHAINS } from "@lit-protocol/constants";

export const getEnv = (name: string): string => {
  const env = process.env[name];
  if (name === "ETHEREUM_PRIVATE_KEY" && (env === undefined || env === "")) {
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  } else if (env === undefined || env === "") {
    return "";
  } else {
    return env;
  }
};

export const getChainInfo = (
  chain: string
): { rpcUrl: string; chainId: number } => {
  if (LIT_CHAINS[chain] === undefined)
    throw new Error(`Chain: ${chain} is not supported by Lit`);

  return {
    rpcUrl: LIT_CHAINS[chain].rpcUrls[0],
    chainId: LIT_CHAINS[chain].chainId,
  };
};
