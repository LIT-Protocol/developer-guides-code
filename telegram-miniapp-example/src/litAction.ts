//@ts-nocheck

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
        // Validating the Telegram user data
        const urlParams = new URLSearchParams(telegramUserData);
        
        const hash = urlParams.get('hash');
        urlParams.delete('hash');
        urlParams.sort();
        
        let dataCheckString = '';
        for (const [key, value] of urlParams.entries()) {
          dataCheckString += `${key}=${value}\n`;
        }
        dataCheckString = dataCheckString.slice(0, -1);
        
        const encoder = new TextEncoder();
        const secretKey = await crypto.subtle.importKey(
          "raw",
          encoder.encode("WebAppData"),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        
        const botTokenKey = await crypto.subtle.sign(
          "HMAC",
          secretKey,
          encoder.encode(telegramBotSecret)
        );
        
        const calculatedHash = await crypto.subtle.sign(
          "HMAC",
          await crypto.subtle.importKey(
            "raw",
            botTokenKey,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          ),
          encoder.encode(dataCheckString)
        );
        
        const calculatedHashHex = Array.from(new Uint8Array(calculatedHash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        const isValid = calculatedHashHex === hash;
        if (!isValid) {
          return Lit.Actions.setResponse({
            response: "false",
            reason: "Invalid Telegram user data",
          });
        }

      const auth_date  = Number(urlParams.get('auth_date'));
      const isRecent = Date.now() / 1000 - auth_date < 600;
      if (!isRecent) {
        return Lit.Actions.setResponse({
          response: "false",
          reason: "Authenticated Telegram user data is older than 10 minutes",
        });
      }

      const userParam = urlParams.get('user');
      const userData = JSON.parse(decodeURIComponent(userParam!));
      const id = userData.id;

      // Checking if usersAuthMethodId is a permitted Auth Method for pkpTokenId
      const usersAuthMethodId = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(`telegram:${id}`)
      );
      const abiEncodedData =
        IS_PERMITTED_AUTH_METHOD_INTERFACE.encodeFunctionData(
          "isPermittedAuthMethod",
          [pkpTokenId, TELEGRAM_AUTH_METHOD_TYPE, usersAuthMethodId]
        );

      console.log("abiEncodedData:", abiEncodedData);
      const isPermittedTx = {
        to: LIT_PKP_PERMISSIONS_CONTRACT_ADDRESS,
        data: abiEncodedData,
      };
      console.log("isPermittedTx:", isPermittedTx);
      const isPermitted = await Lit.Actions.callContract({
        chain: "yellowstone",
        txn: ethers.utils.serializeTransaction(isPermittedTx),
      });
      console.log("isPermitted:", isPermitted);
      if (!isPermitted) {
        return Lit.Actions.setResponse({
          response: "false",
          reason: "Telegram user is not authorized to use this PKP",
        });
      }
  
      Lit.Actions.setResponse({ response: "true" });
      return;
    } catch (error) {
      console.log("error:", error);
      return Lit.Actions.setResponse({
        response: "false",
        reason: `Error: ${error.message}`,
      });
    }
  };
  
  export const litActionCode = `(${_litActionCode.toString()})();`;