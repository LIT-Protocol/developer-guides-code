import { litCustomAuth } from "./litCode";

function App() {
  return (
    <>
      <div className="card">
        <hr />
        <h3>Simple Lit Custom Authentication Example</h3>
        <button onClick={async () => await litCustomAuth()}>
          Connect with Custom Auth
        </button>
        <h5>
          First Signing: Mint a PKP
          <br></br>
          Second Signing: Adding custom AuthMethod to PKP
          <br></br>
          Third Signing: Adding permitted Lit Action to the PKP
        </h5>
        Open the console to see the output!
        <hr />
      </div>
    </>
  );
}

export default App;
