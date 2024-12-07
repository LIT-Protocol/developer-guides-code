const { run } = require("hardhat");

async function main() {
  const contractAddress = "0x85D44bB7d10E8794256687aC923f80c9694Fe838";
  const safeAddress = "0x76B7590972a2BDCE80CE9e4F26Cc8948FDcd104e";

  console.log("Verifying contract with Safe address:", safeAddress);
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [safeAddress],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 