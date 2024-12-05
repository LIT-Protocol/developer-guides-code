import { stytchEmailAuth } from "./litCode";

function App() {

  return (
    <>
      <div className="card">
        <hr />
        <h3>Simple Stytch Email OTP Example</h3>
        <button onClick={async () => await stytchEmailAuth()}>
          Connect with Stytch Email OTP
        </button>
        <h5>
          Open the console to see the authentication process
        </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
