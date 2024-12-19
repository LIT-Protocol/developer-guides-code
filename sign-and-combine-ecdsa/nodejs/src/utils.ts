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

export interface ChainInfo {
  rpcUrl: string;
  chainId: number;
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
}

export const CHAIN_INFO: { [key: string]: ChainInfo } = {
  base: {
    rpcUrl: getEnv("BASE_RPC_URL"),
    chainId: 8453
  },
  arbitrum: {
    rpcUrl: getEnv("ARB_RPC_URL"),
    chainId: 42161
  },
  optimism: {
    rpcUrl: getEnv("OP_RPC_URL"),
    chainId: 10
  }
};

export const SWAP_PARAMS: { [key: string]: SwapParams } = {
  base: {
    tokenIn: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    tokenOut: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
    amountIn: ".2"
  },
  arbitrum: {
    tokenIn: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    tokenOut: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    amountIn: ".3"
  },
  optimism: {
    tokenIn: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    tokenOut: "0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1",
    amountIn: ".1"
  }
};
