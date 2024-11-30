import { runExample } from './litCode';

function App() {
  return (
    <>
      <div className="card">
        <hr />
        <h3>Browser Example</h3>
        <button onClick={async () => await runExample()}>
          Run the example
        </button>
      </div>
    </>
  );
}

export default App;
