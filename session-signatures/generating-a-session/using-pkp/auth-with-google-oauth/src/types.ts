export type GoogleUser = {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  hd?: string;
  email: string;
  email_verified: boolean;
  nbf: number;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
  jti: string;
};

export type MintedPkp = {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
};

export type PkpSessionSigs = any;
