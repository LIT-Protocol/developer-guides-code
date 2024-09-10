import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MetaMaskProvider } from "@metamask/sdk-react";
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "Lit Telegram Mini App",
          url: window.location.href,
        },
      }}
    >
      <App/>
    </MetaMaskProvider>
  </StrictMode>,
);