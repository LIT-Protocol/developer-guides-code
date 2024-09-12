import { useState } from "react";
import { encryptToString } from "./encryptString";
import { decryptString } from "./decryptString";

function App() {
  const [encryptedResult, setEncryptedResult] = useState<{
    ciphertext: string;
    dataToEncryptHash: string;
  }>();
  const [toEncrypt, setToEncrypt] = useState("");

  const handleInputChange = (e: any) => {
    setToEncrypt(e.target.value);
  };

  const handleEncrypt = async () => {
    try {
      const result = await encryptToString(toEncrypt);
      setEncryptedResult(result);
    } catch (error) {
      console.error("Encryption failed:", error);
    }
  };

  return (
    <>
      <div className="card">
        <hr />
        <h3>Encrypt a String</h3>
        <label htmlFor="input">Enter a string to encrypt:</label>
        <br></br>
        <input
          type="text"
          id="input"
          value={toEncrypt}
          onChange={handleInputChange}
        ></input>
        <br></br>
        <button onClick={async () => await handleEncrypt()}>
          Encrypt String
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>

      <div className="card">
        <hr />
        <h3>Decrypt a String</h3>
        <button
          onClick={async () =>
            await decryptString(
              encryptedResult!.ciphertext,
              encryptedResult!.dataToEncryptHash
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
