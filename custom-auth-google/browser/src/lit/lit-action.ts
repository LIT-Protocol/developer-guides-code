// @ts-nocheck

const _litActionCode = async () => {
  console.log("🔄 Starting Lit Action execution...");

  const GOOGLE_AUTH_METHOD_TYPE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `Lit Developer Guide Google Auth Example. Client ID: ${googleClientId}`
    )
  );
  console.log("✅ Generated auth method type:", GOOGLE_AUTH_METHOD_TYPE);

  try {
    // Verify the token with Google
    console.log("🔄 Verifying Google credential...");
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${googleCredential}`
    );

    if (!response.ok) {
      console.log("❌ Failed to verify token with Google");
      return Lit.Actions.setResponse({
        response: "false",
        reason: "Invalid Google credential",
      });
    }

    const tokenInfo = await response.json();
    console.log("✅ Token verified with Google. User ID:", tokenInfo.sub);

    // Verify audience matches our client ID
    if (tokenInfo.aud !== googleClientId) {
      console.log("❌ Invalid audience:", tokenInfo.aud);
      return Lit.Actions.setResponse({
        response: "false",
        reason: "Invalid audience in Google credential",
      });
    }
    console.log("✅ Audience verified");

    // Check if the auth method is permitted for this PKP
    console.log("🔄 Checking PKP authorization...");
    const usersAuthMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`google:${tokenInfo.sub}`)
    );
    console.log("Generated auth method ID:", usersAuthMethodId);

    const isPermitted = await Lit.Actions.isPermittedAuthMethod({
      tokenId: pkpTokenId,
      authMethodType: GOOGLE_AUTH_METHOD_TYPE,
      userId: ethers.utils.arrayify(usersAuthMethodId),
    });

    if (!isPermitted) {
      console.log("❌ User not authorized for this PKP");
      return Lit.Actions.setResponse({
        response: "false",
        reason: "Google user is not authorized to use this PKP",
      });
    }
    console.log("✅ User is authorized for this PKP");

    console.log("✅ All checks passed successfully");
    return Lit.Actions.setResponse({ response: "true" });
  } catch (error) {
    console.log("❌ Error in Lit Action:", error.message);
    return Lit.Actions.setResponse({
      response: "false",
      reason: `Error: ${error.message}`,
    });
  }
};

export const litActionCode = `(${_litActionCode.toString()})();`;
