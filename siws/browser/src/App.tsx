import { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { UnifiedAccessControlConditions } from "@lit-protocol/types";

import SignInButton from "./SignInButton";
import litActionCodeSiws from "./litActions/dist/litActionSiws.js?raw";
import { MainContentProps, SiwsObject } from "./types";
import { getSolRpcConditions } from "./utils";
import { decryptData } from "./litDecrypt";
import { encryptStringForAddress } from "./litEncrypt";

function App() {
  const [inputData, setInputData] = useState("");
  const [encryptedData, setEncryptedData] = useState<{
    ciphertext: string;
    dataToEncryptHash: string;
  } | null>(null);
  const [siwsObject, setSiwsObject] = useState<SiwsObject | null>(null);
  const [solAccessControlConditions, setSolAccessControlConditions] =
    useState<UnifiedAccessControlConditions | null>(null);
  const [decryptedData, setDecryptedData] = useState<string | null>(null);

  const handleSignIn = (siws: SiwsObject) => {
    setSiwsObject(siws);
  };

  const encryptDataHandler = async () => {
    if (!inputData) {
      alert("Please enter data to encrypt");
      return;
    }

    if (!siwsObject) {
      alert("Please sign in first");
      return;
    }

    try {
      const result = await encryptStringForAddress(
        inputData,
        siwsObject.siwsInput.address
      );
      setEncryptedData(result || null);

      setSolAccessControlConditions(
        await getSolRpcConditions(
          siwsObject.siwsInput.address,
          litActionCodeSiws
        )
      );
    } catch (error) {
      console.error("Error encrypting data:", error);
      alert("Failed to encrypt data. Check the console for details.");
    }
  };

  const decryptDataHandler = async () => {
    if (!siwsObject || !solAccessControlConditions || !encryptedData) {
      alert("Missing necessary data for decryption.");
      return;
    }

    try {
      const decryptedData = await decryptData(
        siwsObject,
        solAccessControlConditions,
        encryptedData.ciphertext,
        encryptedData.dataToEncryptHash
      );
      setDecryptedData(decryptedData as string);
    } catch (error) {
      console.error("Error decrypting data:", error);
      alert("Failed to decrypt data. Check the console for details.");
    }
  };

  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <MainContent
            siwsObject={siwsObject}
            handleSignIn={handleSignIn}
            inputData={inputData}
            setInputData={setInputData}
            encryptData={encryptDataHandler}
            encryptedData={encryptedData}
            decryptData={decryptDataHandler}
            decryptedData={decryptedData}
          />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

const MainContent: React.FC<MainContentProps> = ({
  siwsObject,
  handleSignIn,
  inputData,
  setInputData,
  encryptData,
  encryptedData,
  decryptData,
  decryptedData,
}) => {
  const { publicKey } = useWallet();

  return (
    <>
      {/* Wallet Multi Button Card */}
      <div className="card">
        <hr />
        <h3>Connect Your Solana Wallet</h3>
        <WalletMultiButton />
        <hr />
      </div>

      {/* SignIn Button Card - Visible Only When Wallet Is Connected and Not Signed In */}
      {publicKey && !siwsObject && (
        <div className="card">
          <SignInButton onSignIn={handleSignIn} />
          <hr />
        </div>
      )}

      {/* Encrypt Data for Address Card - Visible Only After Sign-In */}
      {siwsObject && (
        <div className="card">
          <h3>Encrypt Data for Address</h3>
          <input
            type="text"
            placeholder="Enter data to encrypt"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
          />
          <br />
          <br />
          <button onClick={encryptData} disabled={!inputData}>
            Encrypt Data
          </button>
          {encryptedData && (
            <div>
              <p>🔐 Data encrypted successfully!</p>
              <p>Ciphertext: {encryptedData.ciphertext}</p>
              <p>Data Hash: {encryptedData.dataToEncryptHash}</p>
            </div>
          )}
          <hr />
        </div>
      )}

      {/* Decrypt Data Card - Visible Only After Encryption */}
      {encryptedData && siwsObject && (
        <div className="card">
          <h3>Decrypt Data</h3>
          <button onClick={decryptData} disabled={!encryptedData}>
            Decrypt Data
          </button>
          {decryptedData && (
            <div>
              <p>🔓 Data decrypted successfully!</p>
              <p>Decrypted Data: {decryptedData}</p>
            </div>
          )}
          <hr />
        </div>
      )}
    </>
  );
};

export default App;
