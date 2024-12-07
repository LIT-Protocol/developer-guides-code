//@ts-nocheck

const _safeAuthLitAction = async () => {
  try {
    const tokenId = await Lit.Actions.pubkeyToTokenId({
      publicKey: pkpPublicKey,
    });
    const owner = (await Lit.Actions.getPermittedAddresses({ tokenId }))[0];
    console.log("owner", owner);

    console.log("Checking if the owner is the Safe...");
    const isSafeOwner = owner.toLowerCase() === safeAddress.toLowerCase();
    console.log("isSafeOwner", isSafeOwner);

    if (!isSafeOwner) {
      console.log("The owner is not the Safe!");
      LitActions.setResponse({ response: "false" });
      return;
    }

    // Encode the getOwners() call
    const iface = new ethers.utils.Interface([
      "function getOwners() public view returns (address[] memory)",
    ]);
    const data = iface.encodeFunctionData("getOwners", []);

    // Create the transaction object
    const tx = {
      to: safeAddress,
      data: data,
    };

    // Serialize the transaction so that Lit can process it
    const serializedTx = ethers.utils.serializeTransaction(tx);

    // Call the contract on the appropriate chain (e.g., "ethereum")
    // Check Lit docs to ensure the correct chain name is used
    const result = await Lit.Actions.callContract({
      chain: "sepolia", // or the chain your Safe is on
      txn: serializedTx,
    });

    // `result` will be the returned data from the call. You will need to decode it.
    // Decode the result using the same interface:
    const [ownersArray] = iface.decodeFunctionResult("getOwners", result);

    const lowerCaseOwners = ownersArray.map((o) => o.toLowerCase());

    let validSignaturesCount = 0;
    for (const sig of signatures) {
      const recoveredAddress = ethers.utils.verifyMessage(messageToSign, sig);
      if (lowerCaseOwners.includes(recoveredAddress.toLowerCase())) {
        validSignaturesCount++;
      }
    }

    // Check threshold
    const threshold = 2;
    const isAuthorized = validSignaturesCount >= threshold;

    LitActions.setResponse({ response: isAuthorized ? "true" : "false" });
  } catch (error) {
    LitActions.setResponse({ response: error.message });
  }
};

export const safeAuthLitActionCode = `(${_safeAuthLitAction.toString()})();`;
