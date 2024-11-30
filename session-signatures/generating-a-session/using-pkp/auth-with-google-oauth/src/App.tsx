import { useState } from 'react';
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from '@react-oauth/google';
import * as jwt_decode from 'jwt-decode';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface GoogleUserData {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<GoogleUserData | null>(null);

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    try {
      const decoded: GoogleUserData = jwt_decode.jwtDecode(
        credentialResponse.credential ?? ''
      );
      console.log('Decoded user data:', decoded);
      setUserData(decoded);
    } catch (err) {
      setError('Failed to decode user data');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="card">
        <hr />
        <h3>Simple Google OAuth Example</h3>

        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError('Login Failed')}
        />

        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

        {userData && (
          <div style={{ marginTop: '1rem', textAlign: 'left' }}>
            <h4>User Data:</h4>
            <img
              src={userData.picture}
              alt="Profile"
              style={{ width: 50, borderRadius: '50%' }}
            />
            <p>Name: {userData.name}</p>
            <p>Email: {userData.email}</p>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
