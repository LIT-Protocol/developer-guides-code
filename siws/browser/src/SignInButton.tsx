import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

import { SiwsObject } from "./types";

interface SignInButtonProps {
  onSignIn: (siwsObject: SiwsObject) => void;
}

function SignInButton({ onSignIn }: SignInButtonProps) {
  const { publicKey, signMessage } = useWallet();

  const handleSignIn = async () => {
    if (!publicKey || !signMessage) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const siwsInput = createSiwsInput(publicKey.toString());
      const siwsMessage = new TextEncoder().encode(getSiwsMessage(siwsInput));
      const signature = await signMessage(siwsMessage);

      const siwsObject: SiwsObject = {
        siwsInput,
        signature: bs58.encode(signature),
      };

      onSignIn(siwsObject);
    } catch (error) {
      console.error("Error signing message:", error);
      alert("Failed to sign in. Check the console for details.");
    }
  };

  function getSiwsMessage(siwsInput: SiwsObject["siwsInput"]) {
    let message = `${siwsInput.domain} wants you to sign in with your Solana account:\n${siwsInput.address}`;

    if (siwsInput.statement) {
      message += `\n\n${siwsInput.statement}`;
    }

    const fields = [];

    if (siwsInput.uri !== undefined) fields.push(`URI: ${siwsInput.uri}`);
    if (siwsInput.version !== undefined)
      fields.push(`Version: ${siwsInput.version}`);
    if (siwsInput.chainId !== undefined)
      fields.push(`Chain ID: ${siwsInput.chainId}`);
    if (siwsInput.nonce !== undefined) fields.push(`Nonce: ${siwsInput.nonce}`);
    if (siwsInput.issuedAt !== undefined)
      fields.push(`Issued At: ${siwsInput.issuedAt}`);
    if (siwsInput.expirationTime !== undefined)
      fields.push(`Expiration Time: ${siwsInput.expirationTime}`);
    if (siwsInput.notBefore !== undefined)
      fields.push(`Not Before: ${siwsInput.notBefore}`);
    if (siwsInput.requestId !== undefined)
      fields.push(`Request ID: ${siwsInput.requestId}`);
    if (siwsInput.resources !== undefined && siwsInput.resources.length > 0) {
      fields.push("Resources:");
      for (const resource of siwsInput.resources) {
        fields.push(`- ${resource}`);
      }
    }

    if (fields.length > 0) {
      message += `\n\n${fields.join("\n")}`;
    }

    return message;
  }

  const createSiwsInput = (
    publicKey: string,
    statement?: string
  ): SiwsObject["siwsInput"] => {
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

    return {
      domain: window.location.hostname,
      address: publicKey,
      statement: statement,
      uri: window.location.origin,
      version: "1",
      chainId: 0,
      nonce: Math.floor(Math.random() * 1000000), // Generate a random nonce
      issuedAt: now.toISOString(),
      expirationTime: expirationTime.toISOString(),
      resources: [],
    };
  };

  return (
    <button onClick={handleSignIn} disabled={!publicKey}>
      Sign In
    </button>
  );
}

export default SignInButton;
