import { litWebAuthnOAuth } from "./litCode";

function App() {

  return (
    <>
      <div className="card">
      <hr />
        <h3>Simple WebAuthn OAuth Example</h3>
        <button onClick={async () => await litWebAuthnOAuth()}>
          Connect with WebAuthn
        </button>
        <h5> First click: Authenticate with WebAuthn
          <br></br>
            Second click: Generate the AuthMethod 
        </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
