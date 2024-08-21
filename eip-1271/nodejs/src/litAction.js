(async () => {
  const WHITELIST_EIP1271_CONTRACT_ADDRESS =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const IS_VALID_SIGNATURE_INTERFACE = new ethers.utils.Interface([
    "isValidSignature(bytes32 _hash, bytes memory _signatures) public view returns (bytes4)",
  ]);

  try {
    const abiEncodedData = IS_VALID_SIGNATURE_INTERFACE.encodeFunctionData(
      "isValidSignature",
      [eip1271MessageHash, eip1271CombinedSignatures]
    );
    const isValidTx = {
      to: WHITELIST_EIP1271_CONTRACT_ADDRESS,
      data: abiEncodedData,
    };
    const isValid = await Lit.Actions.callContract({
      chain: "yellowstone",
      txn: ethers.utils.serializeTransaction(isValidTx),
    });
    if (!isValid) {
      return Lit.Actions.setResponse({
        response: "false",
        reason: "The provided combined signatures is not valid",
      });
    }

    return Lit.Actions.setResponse({ response: "true" });
  } catch (error) {
    return Lit.Actions.setResponse({
      response: "false",
      reason: `Error: ${error.message}`,
    });
  }
})();
