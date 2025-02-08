import { litGoogleOAuth } from "./litCode";

function App() {

  return (
    <>
      <div className="card">
      <hr />
        <h3>Simple Google OAuth Example</h3>
        <button onClick={async () => await litGoogleOAuth()}>
          Connect with Google
        </button>
        <h5> First click: Authenticate with Google
          <br></br>
            Second click: Generate the AuthMethod 
        </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
