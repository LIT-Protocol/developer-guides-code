import { runExample } from "./lit";

function App() {
  return (
    <>
      <div className="card">
        <hr />
        <h3>REPLACE_ME</h3>
        <button onClick={async () => await runExample()}>
          Get PKP Signature
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
