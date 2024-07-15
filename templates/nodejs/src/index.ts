import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

try {
} catch (error) {
  // console.error(error)
} finally {
  // Disconnect from LitNodeClient, etc.
}
