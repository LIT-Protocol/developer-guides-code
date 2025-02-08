import { litWebAuthnOAuthAuthenticate, litWebAuthnOAuthRegister } from "./litCode";

function App() {

  return (
    <>
      <div className="card">
      <hr />
        <h3>Simple WebAuthn OAuth Example</h3>
        <button onClick={async () => await litWebAuthnOAuthRegister()}>
          Connect with WebAuthn
        </button>
        <button onClick={async () => await litWebAuthnOAuthAuthenticate()}>
          Authenticate with WebAuthn
        </button>
        <hr />
      </div>
    </>
  );
}

export default App;
