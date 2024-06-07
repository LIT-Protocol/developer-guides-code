const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

const LIT_NETWORK = getEnv("LIT_NETWORK");
const LIT_RELAYER_URL = `https://${LIT_NETWORK}-relayer.getlit.dev/register-payer`;
const LIT_RELAYER_API_KEY = getEnv("LIT_RELAYER_API_KEY");

interface RegisterPayerResponse {
  payerWalletAddress: string;
  payerSecretKey: string;
}

export const registerPayer = async () => {
  const headers = {
    "api-key": LIT_RELAYER_API_KEY,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(LIT_RELAYER_URL, {
      method: "POST",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`Error: ${await response.text()}`);
    }

    const { payerWalletAddress, payerSecretKey } =
      (await response.json()) as RegisterPayerResponse;

    return { payerWalletAddress, payerSecretKey };
  } catch (error) {
    console.error("Error registering payer:", error);
    throw error;
  }
};
