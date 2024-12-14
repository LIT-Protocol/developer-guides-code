declare global {
  const googleJwt: string;
  const pkpTokenId: string;
  const Lit: any;
  const ethers: any;
}

const _litActionCode = async () => {
  // const GOOGLE_JWT_AUTH_METHOD_TYPE = 6;
  const GOOGLE_JWT_AUTH_METHOD_TYPE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('Lit Developer Guide Google Auth Example')
  );

  try {
    // Verify the JWT token with Google's OAuth service
    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${googleJwt}`
    );

    if (!googleResponse.ok) {
      const errorData = await googleResponse.json();

      // Check if the error is specifically about token expiration
      if (
        errorData.error === 'invalid_token' &&
        errorData.error_description?.includes('expired')
      ) {
        return Lit.Actions.setResponse({
          response: 'false',
          reason: 'Google JWT token has expired',
        });
      }

      return Lit.Actions.setResponse({
        response: 'false',
        reason: 'Failed to verify Google JWT token',
      });
    }

    const verifiedToken = await googleResponse.json();

    // Verify issuer is Google
    if (verifiedToken.iss !== 'https://accounts.google.com') {
      return Lit.Actions.setResponse({
        response: 'false',
        reason: 'Invalid token issuer',
      });
    }

    // Check if usersAuthMethodId is permitted for pkpTokenId
    const usersAuthMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`${verifiedToken.sub}:${verifiedToken.aud}`)
    );

    const isPermitted = await Lit.Actions.isPermittedAuthMethod({
      tokenId: pkpTokenId,
      authMethodType: GOOGLE_JWT_AUTH_METHOD_TYPE,
      userId: ethers.utils.arrayify(usersAuthMethodId),
    });

    if (!isPermitted) {
      return Lit.Actions.setResponse({
        response: 'false',
        reason: 'Google user is not authorized to use this PKP',
      });
    }

    return Lit.Actions.setResponse({ response: 'true' });
  } catch (error) {
    return Lit.Actions.setResponse({
      response: 'false',
      // @ts-ignore
      reason: `Error: ${error.message}`,
    });
  }
};

export const litActionCode = `(${_litActionCode.toString()})();`;
