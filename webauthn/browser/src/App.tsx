import { register, authenticate } from "./litWebAuthn";

function App() {

  return (
    <>
      <div className="card">
      <hr />
        <h3>Passkey Example</h3>
        <button onClick={async () => await register()}>
          Register a Passkey
        </button>
        <button onClick={async () => await authenticate()}>
          Authenticate a Passkey
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
