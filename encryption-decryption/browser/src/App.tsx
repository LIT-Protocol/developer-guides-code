import { useState } from "react";
import { encryptToString } from "./encryptString";
import { decryptString } from "./decryptString";

function App() {
  const [encryptedResult, setEncryptedResult] = useState("");

  const handleEncrypt = async () => {
    try {
      const result = await encryptToString();
      setEncryptedResult(result!);
    } catch (error) {
      console.error("Encryption failed:", error);
    }
  };

  return (
    <>
      <div className="card">
        <hr />
        <h3>Encrypt the JSON</h3>
        <br></br>
        <br></br>
        <button onClick={async () => await handleEncrypt()}>
          Encrypt String
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>

      <div className="card">
        <hr />
        <h3>Decrypt the JSON</h3>
        <button
          onClick={async () =>
            await decryptString(
              encryptedResult
            )
          }
        >
          Decrypt String
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
