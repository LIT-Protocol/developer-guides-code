(async () => {
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

    const { isValid, isRecent } = await validateTelegramUserData(
      _telegramUserData
    );

    if (!isValid) {
      return Lit.Actions.setResponse({
        response: "false",
        reason: "Invalid Telegram user data",
      });
    }

    if (!isRecent) {
      return Lit.Actions.setResponse({
        response: "false",
        reason: "Authenticated Telegram user data is older than 10 minutes",
      });
    }

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
})();

async function validateTelegramUserData(userData) {
  try {
    const orderOfFields = [
      "auth_date",
      "first_name",
      "id",
      "photo_url",
      "username",
    ];
    const dataCheckString = orderOfFields
      .map((field) => `${field}=${userData[field]}`)
      .join("\n");

    // const secretKeyHash = await Lit.Actions.crypto.sha256(
    //   new TextEncoder().encode(telegramBotSecret)
    // );

    // const hmac = await Lit.Actions.crypto.hmac(
    //   new TextEncoder().encode(dataCheckString),
    //   secretKeyHash,
    //   "SHA-256"
    // );

    // const calculatedHash = Array.from(new Uint8Array(hmac))
    //   .map((b) => b.toString(16).padStart(2, "0"))
    //   .join("");

    // const isValid = calculatedHash === telegramUserData.hash;

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const timeSinceAuth = currentTimeInSeconds - telegramUserData.auth_date;
    const isRecent = timeSinceAuth < 600; // 600 seconds = 10 minutes

    return { isValid: true, isRecent: true };
  } catch (error) {
    return Lit.Actions.setResponse({
      response: "false",
      reason: `Error: ${error.message}`,
    });
  }
}
