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
  handleSignIn: (siws: SiwsObject) => Promise<void>;
  authenticatedAddress: string | null;
  authError: string | null;
  isPending: boolean;
}
