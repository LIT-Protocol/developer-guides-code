import { conditionalSigning } from "./connect";

function App() {

  return (
    <>
      <div className="card">
      <hr />
        <h3>Conditional Signing Example</h3>
        <button onClick={async () => await conditionalSigning()}>
        Run the Lit Action
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
