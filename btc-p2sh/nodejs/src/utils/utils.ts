import elliptic from "elliptic";
import * as bip66 from "bip66";
import * as bitcoin from "bitcoinjs-lib";
import BN from "bn.js";
import fetch from "node-fetch";

export const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

export const convertSignature = async (litSignature: any) => {
  const EC = elliptic.ec;
  let r = Buffer.from(litSignature.r, "hex");
  let s = Buffer.from(litSignature.s, "hex");
  let rBN = new BN(r);
  let sBN = new BN(s);

  const secp256k1 = new EC("secp256k1");
  const n = secp256k1.curve.n;

  if (sBN.cmp(n.divn(2)) === 1) {
    sBN = n.sub(sBN);
  }

  r = rBN.toArrayLike(Buffer, "be", 32);
  s = sBN.toArrayLike(Buffer, "be", 32);

  function ensurePositive(buffer: any) {
    if (buffer[0] & 0x80) {
      const newBuffer = Buffer.alloc(buffer.length + 1);
      newBuffer[0] = 0x00;
      buffer.copy(newBuffer, 1);
      return newBuffer;
    }
    return buffer;
  }

  r = ensurePositive(r);
  s = ensurePositive(s);

  let derSignature;
  try {
    derSignature = bip66.encode(r, s);
  } catch (error) {
    console.error("Error during DER encoding:", error);
    throw error;
  }

  const signatureWithHashType = Buffer.concat([
    derSignature,
    Buffer.from([bitcoin.Transaction.SIGHASH_ALL]),
  ]);

  return signatureWithHashType;
};

export const broadcastTransaction = async (txHex: string) => {
  try {
    const response = await fetch("https://mempool.space/api/tx", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: txHex,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error broadcasting transaction: ${errorText}`);
    }

    const txid = await response.text();
    console.log(`Transaction broadcasted successfully. TXID: ${txid}`);
    return txid;
  } catch (error) {
    console.error("Error during DER encoding:", error);
    throw error;
  }
};
