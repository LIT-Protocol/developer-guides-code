export interface SiwsObject {
  siwsInput: {
    domain?: string;
    address: string;
    statement?: string;
    uri?: string;
    version?: string;
    chainId?: number;
    nonce?: number;
    issuedAt?: string;
    expirationTime?: string;
    notBefore?: string;
    requestId?: string;
    resources?: [];
  };
  signature: string;
}
export interface MainContentProps {
  siwsObject: SiwsObject | null;
  handleSignIn: (siws: SiwsObject) => void;
  inputData: string;
  setInputData: (data: string) => void;
  encryptData: () => Promise<void>;
  encryptedData: {
    ciphertext: string;
    dataToEncryptHash: string;
  } | null;
  decryptData: () => Promise<void>;
  decryptedData: string | null;
}
