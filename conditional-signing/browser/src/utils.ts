export const getEnv = (name: string) => {
    const env = import.meta.env[name];
    if (env === undefined || env === "") {
      return "";
    } else {
      return env;
    }
  };