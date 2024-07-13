import { encryptString } from "./encryptString";
import { decryptString } from "./decryptString";

function App() {
  return (
    <>
      <div className="card">
        <hr />
        <h3>Encrypt a String</h3>
        <button onClick={async () => await encryptString()}>
          Encrypt String
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>

      <div className="card">
        <hr />
        <h3>Decrypt a String</h3>
        <button onClick={async () => await decryptString()}>
          Decrypt String
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
