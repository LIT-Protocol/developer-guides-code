/// <reference types="vite/client" />

interface Window {
  google: {
    accounts: {
      oauth2: {
        initCodeClient: (config: {
          client_id: string;
          scope: string;
          ux_mode: string;
          callback: (response: any) => void;
        }) => {
          requestCode: () => void;
        };
      };
    };
  };
}
