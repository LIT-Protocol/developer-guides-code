// @ts-nocheck

const _litActionCode = async () => {
  const LIT_PKP_PERMISSIONS_CONTRACT_ADDRESS =
    "0x60C1ddC8b9e38F730F0e7B70A2F84C1A98A69167";
  const TELEGRAM_AUTH_METHOD_TYPE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("Lit Developer Guide Telegram Auth Example")
  );
  const IS_PERMITTED_AUTH_METHOD_INTERFACE = new ethers.utils.Interface([
    "function isPermittedAuthMethod(uint256 tokenId, uint256 authMethodType, bytes memory id) public view returns (bool)",
  ]);

  try {
    const _telegramUserData = JSON.parse(telegramUserData);

    // Validating the Telegram user data, go here to learn more:
    // https://core.telegram.org/widgets/login#checking-authorization
    const { hash, ...otherData } = _telegramUserData;

    const dataCheckString = Object.entries(otherData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const encoder = new TextEncoder();
    const secretKeyHash = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(telegramBotSecret)
    );
    const key = await crypto.subtle.importKey(
      "raw",
      secretKeyHash,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(dataCheckString)
    );

    const calculatedHash = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const isValid = calculatedHash === _telegramUserData.hash;
    if (!isValid) {
      return Lit.Actions.setResponse({
        response: "false",
        reason: "Invalid Telegram user data",
      });
    }

    const isRecent = Date.now() / 1000 - _telegramUserData.auth_date < 600;
    if (!isRecent) {
      return Lit.Actions.setResponse({
        response: "false",
        reason: "Authenticated Telegram user data is older than 10 minutes",
      });
    }

    // Checking if usersAuthMethodId is a permitted Auth Method for pkpTokenId
    const usersAuthMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`telegram:${_telegramUserData.id}`)
    );
    const abiEncodedData =
      IS_PERMITTED_AUTH_METHOD_INTERFACE.encodeFunctionData(
        "isPermittedAuthMethod",
        [pkpTokenId, TELEGRAM_AUTH_METHOD_TYPE, usersAuthMethodId]
      );
    const isPermittedTx = {
      to: LIT_PKP_PERMISSIONS_CONTRACT_ADDRESS,
      data: abiEncodedData,
    };
    const isPermitted = await Lit.Actions.callContract({
      chain: "yellowstone",
      txn: ethers.utils.serializeTransaction(isPermittedTx),
    });
    if (!isPermitted) {
      return Lit.Actions.setResponse({
        response: "false",
        reason: "Telegram user is not authorized to use this PKP",
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
