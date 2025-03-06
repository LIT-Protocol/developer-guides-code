import { litDiscordOAuth } from "./litCode";

function App() {

  return (
    <>
      <div className="card">
      <hr />
        <h3>Simple Discord OAuth Example</h3>
        <button onClick={async () => await litDiscordOAuth()}>
          Connect with Discord
        </button>
        <h5> First click: Authenticate with Discord
          <br></br>
            Second click: Generate the AuthMethod 
        </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
