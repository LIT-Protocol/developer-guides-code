import { pkpWallet } from './pkpWallet';

function App() {

  return (
    <>
      <div className="card">
      <hr />
        <h3>Lit PKPEthersWallet Example</h3>
        <button onClick={async () => await pkpWallet()}>
        Run Example
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>
    </>
  );
}

export default App;

