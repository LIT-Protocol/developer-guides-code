import "./App.css";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

function App() {
    async function litSetup() {
        console.log("connecting to lit...");
        const litNodeClient = new LitNodeClient({
            litNetwork: "datil-dev",
            debug: true,
        });
        await litNodeClient.connect();
        console.log("connected!");
    }

    return (
        <div className="App">
            <h1>Lit with React</h1>
            <p>Check console</p>
            <button onClick={litSetup}>Instantiate Lit</button>
        </div>
    );
}

export default App;
