import { testGetLitActionSessionSigs } from "./test-get-lit-action-session-sigs";
import { LIT_NETWORK, version as LitVersion } from '@lit-protocol/constants';

function App() {
  const litNetworkOptions = Object.values(LIT_NETWORK).filter(network =>
    !['habanero', 'manzano', 'cayenne', 'localhost', 'custom'].includes(network)
  );
  const defaultNetwork = LIT_NETWORK.Datil;

  return (
    <>
      <div className="card">
        <hr />
        <h3>[{LitVersion}] <br />getLitActionSessionSigs</h3>

        {/* ---------- Required Params ---------- */}
        <hr />
        <label htmlFor="litNetwork">Select Lit Network:</label>
        <select id="litNetwork" style={{ width: '300px', marginBottom: '10px' }} defaultValue={defaultNetwork}>
          {litNetworkOptions.map((network) => (
            <option key={network} value={network}>{network}</option>
          ))}
        </select>
        <hr />

        {/* ---------- Debug Option ---------- */}
        <label htmlFor="debug">
          <input type="checkbox" id="debug" defaultChecked={false} /> Enable Debug
        </label>
        <hr />

        {/* ---------- buttons ---------- */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button onClick={async () => {
            const selectedNetwork = (document.getElementById('litNetwork') as HTMLSelectElement).value;
            const debug = (document.getElementById('debug') as HTMLInputElement).checked;
            await testGetLitActionSessionSigs({
              SELECTED_NETWORK: selectedNetwork as keyof typeof LIT_NETWORK,
              DEBUG: debug
            });
          }}>
            Run Example
          </button>
          <button onClick={() => {
            localStorage.clear()
          }}>
            Clear Cached Data
          </button>
        </div>

        <h5> Check the browser console! </h5>
        <hr />
      </div >
    </>
  );
}

export default App;
