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
const LIT_PAYER_SECRET_KEY = getEnv("LIT_PAYER_SECRET_KEY");

interface AddUserResponse {
  success: boolean;
  error?: string;
}

export const addUsers = async (users: string[]) => {
  const headers = {
    "api-key": LIT_RELAYER_API_KEY,
    "payer-secret-key": LIT_PAYER_SECRET_KEY,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(LIT_RELAYER_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(users),
    });

    if (!response.ok) {
      throw new Error(`Error: ${await response.text()}`);
    }

    const data = (await response.json()) as AddUserResponse;
    if (data.success !== true) {
      throw new Error(`Error: ${data.error}`);
    }

    return true;
  } catch (error) {
    console.error("Error registering payer:", error);
    throw error;
  }
};
