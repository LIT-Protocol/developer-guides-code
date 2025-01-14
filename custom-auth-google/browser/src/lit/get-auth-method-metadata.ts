import { ethers } from "ethers";

interface GoogleJwtPayload {
  iss: string; // Issuer (typically 'accounts.google.com')
  azp: string; // Authorized party
  aud: string; // Audience (your client ID)
  sub: string; // Subject (unique Google ID)
  email?: string; // User's email
  email_verified?: boolean;
  name?: string; // User's full name
  picture?: string; // User's profile picture URL
  given_name?: string; // First name
  family_name?: string; // Last name
  locale?: string; // User's locale
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}

export const getGoogleAuthMethodMetadata = (credentialResponse: {
  credential: string;
  clientId: string;
}) => {
  try {
    // Decode the JWT payload
    const [, payload] = credentialResponse.credential.split(".");

    const decodedToken = JSON.parse(
      Buffer.from(payload, "base64").toString()
    ) as GoogleJwtPayload;

    // Verify expiration
    const isExpired = Date.now() >= decodedToken.exp * 1000;
    if (isExpired) {
      throw new Error("Google credential is expired");
    }

    // Verify audience matches client ID
    if (decodedToken.aud !== credentialResponse.clientId) {
      throw new Error("Invalid audience in Google credential");
    }

    // Generate the auth method type and ID
    const authMethodType = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(
        `Lit Developer Guide Google Auth Example. Client ID: ${credentialResponse.clientId}`
      )
    );
    const authMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`google:${decodedToken.sub}`)
    );

    return {
      authMethodType,
      authMethodId,
      userInfo: {
        sub: decodedToken.sub,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        issuedAt: new Date(decodedToken.iat * 1000),
        expiresAt: new Date(decodedToken.exp * 1000),
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to decode Google credential: ${error.message}`);
    }
    throw new Error("Failed to decode Google credential: Unknown error");
  }
};
