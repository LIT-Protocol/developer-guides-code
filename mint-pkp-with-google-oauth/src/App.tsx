import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode, JwtPayload } from "jwt-decode";

import { mintPkp } from "./mintPkp";
import { getPkpSessionSigs, type MintedPkp } from "./getPkpSessionSigs";

interface CredentialResponse {
  credential?: string;
  select_by?:
    | "auto"
    | "user"
    | "user_1tap"
    | "user_2tap"
    | "btn"
    | "btn_confirm"
    | "btn_add_session"
    | "btn_confirm_add_session";
  clientId?: string;
}

function App() {
  const {
    VITE_GOOGLE_CLIENT_ID = "1018201430137-q4155dn6l9ip2qth5sa4kcphct0p35tn.apps.googleusercontent.com",
  } = import.meta.env;
  const [googleJwt, setGoogleJwt] = useState<string | undefined>();
  const [decodedGoogleJwt, setDecodedGoogleJwt] = useState<
    JwtPayload | undefined
  >();
  const [mintedPkp, setMintedPkp] = useState<MintedPkp | undefined>();
  const [pkpSessionSigs, setPkpSessionSigs] = useState<any | undefined>();

  const parseGoogleCredential = async (response: CredentialResponse) => {
    const jwt = response.credential as string;
    setGoogleJwt(jwt);
    try {
      const decoded = await decodeAndValidateGoogleJWT(jwt);
      setDecodedGoogleJwt(decoded);
    } catch (error) {
      console.error("Failed to decode and validate Google JWT:", error);
    }
  };

  const handleOAuthError = (error: unknown) => {
    console.log("Google OAuth Error:", error);
  };

  const decodeAndValidateGoogleJWT = async (token: string) => {
    console.log("🔄 Validating Google JWT and getting user info...");
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      throw new Error("Invalid token format");
    }

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp! < now) {
      throw new Error("Token has expired");
    }

    if (
      decoded.iss !== "https://accounts.google.com" &&
      decoded.iss !== "accounts.google.com"
    ) {
      throw new Error("Invalid token issuer");
    }

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    if (!response.ok) {
      throw new Error("Failed to verify token with Google");
    }

    const googleVerification = await response.json();

    if (googleVerification.aud !== VITE_GOOGLE_CLIENT_ID) {
      throw new Error("Token audience mismatch");
    }
    console.log("✅ Validated Google JWT and got user info");

    return decoded;
  };

  const _mintPkp = async () => {
    if (decodedGoogleJwt) {
      try {
        const minted = await mintPkp(decodedGoogleJwt);
        setMintedPkp(minted);
      } catch (error) {
        console.error("Failed to mint PKP:", error);
      }
    }
  };

  const _getPkpSessionSigs = async () => {
    if (googleJwt && mintedPkp) {
      try {
        const sessionSigs = await getPkpSessionSigs(googleJwt, mintedPkp);
        setPkpSessionSigs(sessionSigs);
      } catch (error) {
        console.error("Failed to get PKP session signatures:", error);
      }
    }
  };

  return (
    <GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID}>
      <div>
        <div className="card">
          <h3>Mint a PKP Using a Google Account</h3>
          <hr />
        </div>

        <div className="card">
          <h4>Step 1: Authenticate with Google</h4>
          {!decodedGoogleJwt ? (
            <GoogleLogin
              onSuccess={parseGoogleCredential}
              onError={handleOAuthError}
            />
          ) : (
            <p>Authenticated as: {decodedGoogleJwt.email}</p>
          )}
          <hr />
        </div>

        {decodedGoogleJwt && (
          <div className="card">
            <h4>Step 2: Mint PKP</h4>
            <button onClick={_mintPkp} disabled={!!mintedPkp}>
              {mintedPkp ? "PKP Minted" : "Mint PKP"}
            </button>
            {mintedPkp && (
              <div>
                <p>Successfully minted PKP!</p>
                <p> Check the JavaScript console for PKP info</p>
              </div>
            )}
            <hr />
          </div>
        )}

        {mintedPkp && (
          <div className="card">
            <h4>Step 3: Get PKP Session Signatures</h4>
            <button onClick={_getPkpSessionSigs} disabled={!!pkpSessionSigs}>
              {pkpSessionSigs
                ? "Session Sigs Retrieved"
                : "Get PKP Session Sigs"}
            </button>
            {pkpSessionSigs && (
              <div>
                <p>Successfully generated Session Signatures!</p>
                <p>Check the JavaScript console for PKP info</p>
              </div>
            )}
            <hr />
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
