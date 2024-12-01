const window: any = globalThis;

export const getEnv = (name: string): string => {
  // Browser environment for apps
  if (typeof window !== 'undefined') {
    const envMap: Record<string, string | undefined> = {
      'ETHEREUM_PRIVATE_KEY': process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY,
    };
    const env = envMap[name];
    if (!env) {
      throw new Error(`${name} ENV is not defined, please define it in the .env file`);
    }
    return env;
  }
  
  // Node environment
  const env = process.env[name];
  if (!env) {
    throw new Error(`${name} ENV is not defined, please define it in the .env file`);
  }
  return env;
};