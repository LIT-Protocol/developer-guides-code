import { fetchLitAction } from "./fetchLitAction";

function App() {

  return (
    <>
      <div className="card">
      <hr />
        <h3>Fetching Within a Lit Action Example</h3>
        <button onClick={async () => await fetchLitAction()}>
        Run Example
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
