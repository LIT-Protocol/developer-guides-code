import { useEffect, useState } from "react";
import { useSDK } from "@metamask/sdk-react";

import "./App.css";
import litLogo from "./assets/lit.png";
import {
  getSessionSignatures,
  connectToLitNodes,
  mintNewPkp,
} from "./litConnections";
import {
  isRecent,
  verifyInitData,
} from "./telegramAuthHelpers";


interface TelegramWebApp {
  ready: () => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons: Array<{ text: string; type: string }>;
  }) => void;
  initData: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

function App() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [sessionSignatures, setSessionSignatures] = useState<any | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [recent, setRecent] = useState<boolean | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [pkp, setPkp] = useState<{
    tokenId: any;
    publicKey: string;
    ethAddress: string;
  } | null>(null);
  const { sdk, connected, provider } = useSDK();

  useEffect(() => {
    const tgApp = window.Telegram?.WebApp;
    if (tgApp) {
      tgApp.ready();
      setWebApp(tgApp);
      setData(tgApp.initData);

      isRecent(tgApp.initData).then((isRecent) => {
        setRecent(isRecent);
      });

      verifyInitData(tgApp.initData, import.meta.env.VITE_TELEGRAM_BOT_TOKEN)
        .then(( isVerified ) => {
          setValid(isVerified);
        })
        .catch((error) => {
          console.error("Error verifying init data:", error);
        });
    }
  }, []);

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      setAccount(accounts?.[0]);
      
      webApp!.showPopup({
        title: "Connected",
        message: `Connected to MetaMask with account: ${accounts[0]}`,
        buttons: [{ text: "Close", type: "close" }],
      });
    } catch (err) {
      console.warn("failed to connect..", err);
    }
  };

  const mintPkp = async () => {
    const pkp = await mintNewPkp(provider);
    setPkp(pkp);
  };

  const getSessionSigs = async () => {
    const litNodeClient = await connectToLitNodes();
    const sessionSignatures = await getSessionSignatures(
      litNodeClient,
      pkp,
      provider,
      data
    );
    setSessionSignatures(sessionSignatures);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={litLogo} className="App-logo" alt="logo" />
        <h1>Telegram Mini App</h1>
      </header>
      {
        <div>
          <h3>Telegram User Data Validity:</h3>
          <pre> Recent: {JSON.stringify(recent, null, 2)}</pre>
          <pre> Valid: {JSON.stringify(valid, null, 2)}</pre>
        </div>
      }
      <button style={{ padding: 10, margin: 10 }} onClick={connect}>
        {connected ? "Connect to MetaMask" : "Connected"}
      </button>
      {connected && <div>{account && `Connected account: ${account}`}</div>}
      {connected && (
        <button style={{ padding: 10, margin: 10 }} onClick={getSessionSigs}>
          Get Session Signatures
        </button>
      )}
      {sessionSignatures && (
        <div className="boxed-code-display">
          <div className="boxed-code-display__container">
            <h2 className="boxed-code-display__title">Session Signatures:</h2>
            <pre className="boxed-code-display__content">
              {JSON.stringify(sessionSignatures, null, 2)}
            </pre>
          </div>
        </div>
      )}
      {connected && (
        <button style={{ padding: 10, margin: 10 }} onClick={mintPkp}>
          Mint PKP
        </button>
      )}
      {pkp && (
        <div className="boxed-code-display">
          <div className="boxed-code-display__container">
            <h2 className="boxed-code-display__title">PKP:</h2>
            <pre className="boxed-code-display__content">
              {JSON.stringify(pkp, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;