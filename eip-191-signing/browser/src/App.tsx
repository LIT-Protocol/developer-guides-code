import { signEIP191 } from "./eip-191";

function App() {

  return (
    <>
      <div className="card">
      <hr />
        <h3>Lit EIP-191 Signing Example</h3>
        <button onClick={async () => await signEIP191()}>
        Run Example
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
