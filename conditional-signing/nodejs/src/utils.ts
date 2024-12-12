export const getEnv = (name: string): string => {
    // Browser environment
    if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
      const envMap: Record<string, string | undefined> = {
        'ETHEREUM_PRIVATE_KEY': process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY,
        'LIT_PKP_PUBLIC_KEY': process.env.NEXT_PUBLIC_LIT_PKP_PUBLIC_KEY,
        'LIT_CAPACITY_CREDIT_TOKEN_ID': process.env.NEXT_PUBLIC_LIT_CAPACITY_CREDIT_TOKEN_ID,
        'CHAIN_TO_CHECK_CONDITION_ON': process.env.NEXT_PUBLIC_CHAIN_TO_CHECK_CONDITION_ON,
      };
      const env = envMap[name];
      if (env === undefined || env === "")
        throw new Error(
          `${name} ENV is not defined, please define it in the .env file`
        );
      return env;
    }
    
    // Node environment
    const env = process.env[name];
    if (env === undefined || env === "")
      throw new Error(
        `${name} ENV is not defined, please define it in the .env file`
      );
    return env;
};