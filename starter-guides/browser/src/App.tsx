import { connectToLit } from "./connect";

function App() {

  return (
    <>
      <div className="card">
      <hr />
        <h3>Simple LitNodeClient Connection</h3>
        <button onClick={async () => await connectToLit()}>
        Connect
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
