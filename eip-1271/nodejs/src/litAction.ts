// @ts-nocheck

const _litActionCode = async () => {
  const WHITELIST_EIP1271_CONTRACT_ADDRESS =
    "0x54a772813Df0E75f20A0984f31D1400991eD6a33";
  const IS_VALID_SIGNATURE_INTERFACE = new ethers.utils.Interface([
    "function isValidSignature(bytes32 _hash, bytes memory _signatures) public view returns (bytes4)",
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
    const isValidResponse = await Lit.Actions.callContract({
      chain: "yellowstone",
      txn: ethers.utils.serializeTransaction(isValidTx),
    });
    if (
      isValidResponse !==
      "0x1626ba7e00000000000000000000000000000000000000000000000000000000"
    ) {
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
};

export const litActionCode = `(${_litActionCode.toString()})();`;
