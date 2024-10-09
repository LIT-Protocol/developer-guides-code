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

import SignInButton from "./SignInButton";
import { MainContentProps, SiwsObject } from "./types";
import { authenticateSiwsMessage } from "./litSiws";

function App() {
  const [siwsObject, setSiwsObject] = useState<SiwsObject | null>(null);
  const [authenticatedAddress, setAuthenticatedAddress] = useState<
    string | null
  >(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleSignIn = async (siws: SiwsObject) => {
    setSiwsObject(siws);
    setIsPending(true);
    try {
      const authenticatedAddress = await authenticateSiwsMessage(siws);
      if (authenticatedAddress) {
        setAuthenticatedAddress(authenticatedAddress);
        setAuthError(null);
        console.log("SIWS authenticated successfully", authenticatedAddress);
      } else {
        setAuthError("Failed to authenticate SIWS message");
        setAuthenticatedAddress(null);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setAuthError("An error occurred during authentication");
      setAuthenticatedAddress(null);
    } finally {
      setIsPending(false);
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
            authenticatedAddress={authenticatedAddress}
            authError={authError}
            isPending={isPending}
          />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

const MainContent: React.FC<MainContentProps> = ({
  siwsObject,
  handleSignIn,
  authenticatedAddress,
  authError,
  isPending,
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

      {/* Authentication Result Card */}
      {(authenticatedAddress || authError || isPending) && (
        <div className="card">
          {isPending && (
            <div>
              <h3>Authentication in Progress</h3>
              <p>Please wait while we verify your signature...</p>
            </div>
          )}
          {authenticatedAddress && (
            <div>
              <h3>Authentication Successful</h3>
              <p>Authenticated Address: {authenticatedAddress}</p>
            </div>
          )}
          {authError && (
            <div>
              <h3>Authentication Error</h3>
              <p>{authError}</p>
            </div>
          )}
          <hr />
        </div>
      )}
    </>
  );
};

export default App;
