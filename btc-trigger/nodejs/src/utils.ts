export const getEnv = (name: string): string => {
  // Browser environment
  if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
    const envMap: Record<string, string | undefined> = {
      'PKP_PUBLIC_KEY': process.env.NEX_PUBLIC_PKP_PUBLIC_KEY,
      'ETHEREUM_PRIVATE_KEY': process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY,
      'BTC_DESTINATION_ADDRESS': process.env.NEX_PUBLIC_BTC_DESTINATION_ADDRESS,
      'BROADCAST_URL': process.env.NEX_PUBLIC_BROADCAST_URL,
      'LIT_NETWORK': process.env.NEX_PUBLIC_LIT_NETWORK,
      'LIT_CAPACITY_CREDIT_TOKEN_ID': process.env.NEXT_PUBLIC_LIT_CAPACITY_CREDIT_TOKEN_ID,
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