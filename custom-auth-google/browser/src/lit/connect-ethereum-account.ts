import { ethers } from "ethers";

export const connectEthereumAccount = async () => {
  console.log("🔄 Connecting to Ethereum account...");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const ethersSigner = provider.getSigner();
  console.log(
    "✅ Connected Ethereum account:",
    await ethersSigner.getAddress()
  );

  return ethersSigner;
};
