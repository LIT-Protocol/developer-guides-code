import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import * as lit from "./lit";
import { useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentialResponse, setCredentialResponse] = useState<any>(null);
  const [pkpInfo, setPkpInfo] = useState<any>(null);

  const handleGoogleSuccess = (response: any) => {
    console.log("Google login successful:", response);
    setIsAuthenticated(true);
    setCredentialResponse(response);
  };

  const handleGoogleError = () => {
    console.log("Google login failed");
    setIsAuthenticated(false);
    setCredentialResponse(null);
  };

  const handleMintPKP = async () => {
    if (!credentialResponse) {
      console.error("No credential response available");
      return;
    }
    try {
      const pkp = await lit.mintPkpUsingGoogleAndLitRelayer(credentialResponse);
      console.log("Minted PKP:", pkp);
      setPkpInfo(pkp);
    } catch (error) {
      console.error("Error minting PKP:", error);
      setPkpInfo(null);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="card">
        <hr />
        <h3>Lit Relayer Google oAuth Example</h3>
        {!isAuthenticated ? (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        ) : (
          <>
            <p>Authenticated successfully!</p>
            <button onClick={handleMintPKP}>Mint PKP</button>
            {pkpInfo && (
              <div>
                <h4>PKP Information:</h4>
                <p>Public Key: {pkpInfo.publicKey}</p>
                <p>ETH Address: {pkpInfo.ethAddress}</p>
                <p>Token ID: {pkpInfo.tokenId}</p>
              </div>
            )}
          </>
        )}
        <h5>Check the browser console!</h5>
        <hr />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
