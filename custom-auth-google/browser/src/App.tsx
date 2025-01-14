import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useState } from "react";

import { mintPkp } from "./lit/mint-pkp";
import { getPkpSessionSigs } from "./lit/get-pkp-session-sigs";
import { MintedPkp } from "./lit/get-pkp-session-sigs";

type PkpSessionSigs = any;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentialResponse, setCredentialResponse] = useState<any>(null);
  const [pkpInfo, setPkpInfo] = useState<MintedPkp | null>(null);
  const [sessionSigs, setSessionSigs] = useState<PkpSessionSigs | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = (response: any) => {
    console.log("Google login successful:", response);
    setIsAuthenticated(true);
    setCredentialResponse(response);
    setError(null);
  };

  const handleGoogleError = () => {
    console.log("Google login failed");
    setIsAuthenticated(false);
    setCredentialResponse(null);
    setError("Google authentication failed. Please try again.");
  };

  const handleMintPKP = async () => {
    if (!credentialResponse) {
      setError("No credential response available");
      return;
    }
    try {
      const pkp = await mintPkp(credentialResponse);
      if (!pkp) {
        throw new Error("Failed to mint PKP");
      }
      console.log("Minted PKP:", pkp);
      setPkpInfo(pkp);
      setError(null);
    } catch (error) {
      console.error("Error minting PKP:", error);
      setPkpInfo(null);
      setSessionSigs(null);
      setError("Failed to mint PKP. Please try again.");
    }
  };

  const handleGetSessionSigs = async () => {
    if (!credentialResponse || !pkpInfo) {
      setError("Missing credentials or PKP info");
      return;
    }
    try {
      console.log("Getting session signatures...");
      const sigs = await getPkpSessionSigs(credentialResponse, pkpInfo);
      console.log("Got session signatures:", sigs);
      setSessionSigs(sigs);
      setError(null);
    } catch (error) {
      console.error("Error getting session signatures:", error);
      setSessionSigs(null);
      setError("Failed to get session signatures. Please try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div>
        <div className="card">
          <h3>Mint a PKP Using a Google Account</h3>
          <hr />
        </div>

        <div className="card">
          <h4>Step 1: Authenticate with Google</h4>
          {!isAuthenticated ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          ) : (
            <div>
              <p>Authenticated successfully!</p>
              <pre>{JSON.stringify(credentialResponse, null, 2)}</pre>
            </div>
          )}
          <hr />
        </div>

        {isAuthenticated && (
          <div className="card">
            <h4>Step 2: Mint PKP</h4>
            <button onClick={handleMintPKP} disabled={!!pkpInfo}>
              {pkpInfo ? "PKP Minted" : "Mint PKP"}
            </button>
            {pkpInfo && (
              <div>
                <p>Successfully minted PKP!</p>
                <h5>PKP Information:</h5>
                <p>Public Key: {pkpInfo.publicKey}</p>
                <p>ETH Address: {pkpInfo.ethAddress}</p>
                <p>Token ID: {pkpInfo.tokenId}</p>
              </div>
            )}
            <hr />
          </div>
        )}

        {pkpInfo && (
          <div className="card">
            <h4>Step 3: Get PKP Session Signatures</h4>
            <button onClick={handleGetSessionSigs} disabled={!!sessionSigs}>
              {sessionSigs ? "Session Sigs Retrieved" : "Get PKP Session Sigs"}
            </button>
            {sessionSigs && (
              <div>
                <p>Successfully generated Session Signatures!</p>
                <p>Check the browser console for detailed information.</p>
              </div>
            )}
            <hr />
          </div>
        )}

        {error && (
          <div className="card error-message">
            <p>{error}</p>
            <hr />
          </div>
        )}

        <div className="card">
          <h5>Check the browser console for detailed information!</h5>
          <hr />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
