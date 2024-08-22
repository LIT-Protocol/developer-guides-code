export const getEnv = (name) => {
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