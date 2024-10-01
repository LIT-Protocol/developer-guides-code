import { signAndCombineEcdsa } from "./lit";

function App() {
  const handleSignAndCombine = async () => {
    try {
      const result = await signAndCombineEcdsa("ethereum");
      console.log("Sign and Combine ECDSA Result:", result);
    } catch (error) {
      console.error("Error in Sign and Combine ECDSA:", error);
    }
  };

  return (
    <>
      <div className="card">
        <hr />
        <h3>Sign and Combine ECDSA Example</h3>
        <button onClick={handleSignAndCombine}>Sign and Combine ECDSA</button>
        <h5>Check the browser console!</h5>
        <hr />
      </div>
    </>
  );
}

export default App;
