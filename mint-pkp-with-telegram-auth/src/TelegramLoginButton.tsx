import React, { useEffect, useRef, useCallback } from "react";

import { type TelegramUser } from "./types";

interface TelegramLoginButtonProps {
  botName: string;
  dataOnauth: (user: TelegramUser) => void;
  buttonSize?: "large" | "medium" | "small";
  requestAccess?: "write" | "read";
}

declare global {
  interface Window {
    TelegramLoginCallback?: (user: TelegramUser) => void;
  }
}

const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  botName,
  dataOnauth,
  buttonSize = "large",
  requestAccess = "write",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAuth = useCallback(
    (user: TelegramUser) => {
      console.log("Telegram user:", user);
      dataOnauth(user);
    },
    [dataOnauth]
  );

  useEffect(() => {
    window.TelegramLoginCallback = handleAuth;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", buttonSize);
    script.setAttribute("data-request-access", requestAccess);
    script.setAttribute("data-onauth", "TelegramLoginCallback(user)");

    containerRef.current?.appendChild(script);

    return () => {
      containerRef.current?.removeChild(script);
      delete window.TelegramLoginCallback;
    };
  }, [botName, handleAuth, buttonSize, requestAccess]);

  return <div ref={containerRef}></div>;
};

export default TelegramLoginButton;
