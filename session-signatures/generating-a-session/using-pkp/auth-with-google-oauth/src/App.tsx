import { useState } from 'react';
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from '@react-oauth/google';
import * as jwt_decode from 'jwt-decode';
import type { SigResponse } from '@lit-protocol/types';
import { ethers } from 'ethers';

import './App.css';
import { mintPkp } from './mintPkp';
import type { GoogleUser, MintedPkp, PkpSessionSigs } from './types';
import { getPkpSessionSigs } from './getPkpSessionSigs';
import { pkpSign } from './pkpSign';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  const [error, setError] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const [mintedPkp, setMintedPkp] = useState<MintedPkp | null>(null);
  const [signedData, setSignedData] = useState<SigResponse | null>(null);
  const [verifiedAddress, setVerifiedAddress] = useState<string | null>(null);
  const [pkpSessionSigs, setPkpSessionSigs] = useState<PkpSessionSigs | null>(
    null
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [messageToSign, setMessageToSign] = useState<string>('');

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setGoogleCredential(credentialResponse.credential ?? '');

      const decoded: GoogleUser = jwt_decode.jwtDecode(
        credentialResponse.credential ?? ''
      );
      setGoogleUser(decoded);
      setError(null);
    } catch (err) {
      setError('Failed to decode user data');
    }
  };

  const handleMintPkp = async () => {
    if (!googleUser || !googleCredential) return;

    try {
      const minted = await mintPkp(googleUser);
      setMintedPkp(minted!);
    } catch (mintError) {
      console.error('Failed to mint PKP:', mintError);
      setError('Failed to mint PKP. Please try again.');
    }
  };

  const handleGetPkpSessionSigs = async () => {
    if (googleCredential && mintedPkp) {
      try {
        console.log(
          '🔄 Getting PKP session signatures with PKP Token ID:',
          mintedPkp.tokenId
        );
        const sessionSigs = await getPkpSessionSigs(
          googleCredential,
          mintedPkp
        );
        setPkpSessionSigs(sessionSigs);
      } catch (error) {
        console.error('Failed to get PKP session signatures:', error);
        setValidationError(
          'Failed to get PKP session signatures. Please try again.'
        );
      }
    }
  };

  const handleSignData = async () => {
    if (pkpSessionSigs && mintedPkp) {
      try {
        const signature = await pkpSign(
          pkpSessionSigs,
          mintedPkp.publicKey,
          messageToSign
        );
        setSignedData(signature!);
      } catch (error) {
        console.error('Failed to sign data with PKP:', error);
        setValidationError('Failed to sign data with PKP. Please try again.');
      }
    }
  };

  const verifySignature = async () => {
    if (signedData && mintedPkp) {
      try {
        const dataSigned = `0x${signedData.dataSigned}`;
        const encodedSig = ethers.utils.joinSignature({
          v: signedData.recid,
          r: `0x${signedData.r}`,
          s: `0x${signedData.s}`,
        });

        const recoveredAddress = ethers.utils.recoverAddress(
          dataSigned,
          encodedSig
        );

        setVerifiedAddress(recoveredAddress);

        const isValid =
          recoveredAddress.toLowerCase() === mintedPkp.ethAddress.toLowerCase();
        setValidationError(
          isValid
            ? null
            : "Signature verification failed - addresses don't match!"
        );
      } catch (error) {
        console.error('Failed to verify signature:', error);
        setValidationError('Failed to verify signature. Please try again.');
      }
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="card">
        <h3>Mint a PKP Using a Google Account</h3>
        <hr />
      </div>

      <div className="card">
        <h4>Step 1: Authenticate with Google</h4>
        <div className="auth-container">
          {!googleUser ? (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError('Login Failed')}
            />
          ) : (
            <div>
              <p>Authenticated as:</p>
              <div className="code-wrap">
                <img
                  src={googleUser.picture}
                  alt="Profile"
                  style={{ width: 50, borderRadius: '50%' }}
                />
                <p>Name: {googleUser.name}</p>
                <p>Email: {googleUser.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {googleUser && (
        <div className="card">
          <h4>Step 2: Mint PKP</h4>
          <button onClick={handleMintPkp} disabled={!!mintedPkp}>
            {mintedPkp ? 'PKP Minted' : 'Mint PKP'}
          </button>
          {mintedPkp && (
            <div>
              <p>Successfully minted PKP!</p>
              <div>
                <div>
                  <strong>Token ID:</strong>
                  <div className="code-wrap">{mintedPkp.tokenId}</div>
                </div>
                <div>
                  <strong>Public Key:</strong>
                  <div className="code-wrap">{mintedPkp.publicKey}</div>
                </div>
                <div>
                  <strong>ETH Address:</strong>
                  <div className="code-wrap">{mintedPkp.ethAddress}</div>
                </div>
              </div>
            </div>
          )}
          <hr />
        </div>
      )}

      {mintedPkp && (
        <div className="card">
          <h4>Step 3: Get PKP Session Signatures</h4>
          <button onClick={handleGetPkpSessionSigs} disabled={!!pkpSessionSigs}>
            {pkpSessionSigs ? 'Session Sigs Retrieved' : 'Get PKP Session Sigs'}
          </button>
          {pkpSessionSigs && (
            <div>
              <p>Successfully generated Session Signatures!</p>
              <p>Check the JavaScript console for Session Sigs info</p>
            </div>
          )}
          <hr />
        </div>
      )}

      {pkpSessionSigs && (
        <div className="card">
          <h4>Step 4: Sign Data with PKP</h4>
          <div className="input-button-container">
            <input
              type="text"
              value={messageToSign}
              onChange={(e) => setMessageToSign(e.target.value)}
              placeholder="Enter a message to sign"
            />
            <button
              onClick={handleSignData}
              disabled={!!signedData || !messageToSign}
            >
              {signedData ? 'Data Signed' : 'Sign Data with PKP'}
            </button>
          </div>
          {signedData && (
            <div>
              <p>Successfully signed data with PKP!</p>
              <div className="code-wrap">
                {JSON.stringify(signedData, null, 2)}
              </div>
            </div>
          )}
          <hr />
        </div>
      )}

      {signedData && (
        <div className="card">
          <h4>Step 5: Verify Signature</h4>
          <button onClick={verifySignature} disabled={!!verifiedAddress}>
            {verifiedAddress ? 'Signature Verified' : 'Verify Signature'}
          </button>
          {verifiedAddress && (
            <div>
              <p>
                <strong>Recovered Address:</strong>
              </p>
              <div className="code-wrap">{verifiedAddress}</div>
              <p>
                <strong>PKP ETH Address:</strong>
              </p>
              <div className="code-wrap">{mintedPkp?.ethAddress}</div>
              {validationError ? (
                <p style={{ color: 'red' }}>{validationError}</p>
              ) : (
                <p style={{ color: 'green' }}>
                  ✓ Addresses match! Signature is valid.
                </p>
              )}
            </div>
          )}
          <hr />
        </div>
      )}
    </GoogleOAuthProvider>
  );
}

export default App;
