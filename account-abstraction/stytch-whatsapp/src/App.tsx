import { stytchSmsAuth } from "./connect";

function App() {

  return (
    <>
      <div className="card">
        <hr />
        <h3>Simple Stytch SMS OTP Example</h3>
        <button onClick={async () => await stytchSmsAuth()}>
          Connect with Stytch SMS OTP
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
