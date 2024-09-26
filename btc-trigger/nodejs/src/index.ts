import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, LIT_RPC,  } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LIT_NETWORKS_KEYS } from "@lit-protocol/types";
import BN from "bn.js";
import mempoolJS from "@mempool/mempool.js";
import fetch from "node-fetch";
import elliptic from "elliptic";
import * as bitcoin from "bitcoinjs-lib";
import * as ethers from "ethers";
import * as ecc from "tiny-secp256k1";
import * as bip66 from "bip66";
import * as crypto from "crypto";

import { litActionCode } from "./litAction";
import { getEnv } from "./utils";

const PKP_PUBLIC_KEY = getEnv("PKP_PUBLIC_KEY");
const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const BTC_DESTINATION_ADDRESS = getEnv("BTC_DESTINATION_ADDRESS");
const BROADCAST_URL = getEnv("BROADCAST_URL");
const LIT_NETWORK = process.env["LIT_NETWORK"] as LIT_NETWORKS_KEYS || LitNetwork.Datil;
const LIT_CAPACITY_CREDIT_TOKEN_ID = process.env["LIT_CAPACITY_CREDIT_TOKEN_ID"];

const ethersWallet = new ethers.Wallet(
  ETHEREUM_PRIVATE_KEY,
  new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

const address = ethersWallet.address;

const EC = elliptic.ec;
bitcoin.initEccLib(ecc);

export const executeBtcSigning = async () => {
  let litNodeClient: LitNodeClient;

  try {
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();

    const litContracts = new LitContracts({
      signer: ethersWallet,
      network: LIT_NETWORK,
      debug: false,
    });
    await litContracts.connect();

    let capacityTokenId = LIT_CAPACITY_CREDIT_TOKEN_ID;
    if (!capacityTokenId) {
      console.log("🔄 No Capacity Credit provided, minting a new one...");
      const mintResult = await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 1,
      });
      capacityTokenId = mintResult.capacityTokenIdStr;
      console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
    } else {
      console.log(`ℹ️  Using provided Capacity Credit with ID: ${LIT_CAPACITY_CREDIT_TOKEN_ID}`);
    }

    console.log("🔄 Creating capacityDelegationAuthSig...");
    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersWallet,
        capacityTokenId,
        delegateeAddresses: [address],
        uses: "1",
      });
    console.log("✅ Capacity Delegation Auth Sig created");

    console.log("🔄 Getting Session Signatures...");
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      capabilityAuthSigs: [capacityDelegationAuthSig],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      authNeededCallback: async ({
        resourceAbilityRequests,
        expiration,
        uri,
      }) => {
        const toSign = await createSiweMessageWithRecaps({
          uri: uri!,
          expiration: expiration!,
          resources: resourceAbilityRequests!,
          walletAddress: address,
          nonce: await litNodeClient!.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersWallet,
          toSign,
        });
      },
    });
    console.log("✅ Got Session Signatures");

    console.log("🔄 Deriving a BTC Base58 Address from the Public Key...");
    const pubKeyBuffer = Buffer.from(PKP_PUBLIC_KEY, "hex");
    const sha256Hash = crypto.createHash("sha256").update(pubKeyBuffer).digest();
    const ripemd160Hash = crypto
      .createHash("ripemd160")
      .update(sha256Hash)
      .digest();
    const btcAddress = bitcoin.address.toBase58Check(ripemd160Hash, 0x00);
    console.log("✅ BTC Base58 Address derived:", btcAddress);

    console.log("🔄 Fetching UTXO information...");
    const {
      bitcoin: { addresses, transactions },
    } = mempoolJS({
      hostname: "mempool.space",
      network: "mainnet",
    });

    const addressTxsUtxos = await addresses.getAddressTxsUtxo({
      address: btcAddress,
    });

    const utxo = addressTxsUtxos[0];
    const amountToSend = BigInt(utxo.value - 500);

    const utxoTxDetails = await transactions.getTx({ txid: utxo.txid });
    const scriptPubKey = utxoTxDetails.vout[utxo.vout].scriptpubkey;
    console.log("✅ UTXO information fetched");

    console.log("🔄 Creating a new transaction...");
    const tx = new bitcoin.Transaction();
    tx.version = 2;

    tx.addInput(Buffer.from(utxo.txid, "hex").reverse(), utxo.vout);
    const network = bitcoin.networks.bitcoin;
    tx.addOutput(
      bitcoin.address.toOutputScript(BTC_DESTINATION_ADDRESS, network),
      amountToSend
    );
    const scriptPubKeyBuffer = Buffer.from(scriptPubKey, "hex");

    const sighash = tx.hashForSignature(
      0,
      bitcoin.script.compile(scriptPubKeyBuffer),
      bitcoin.Transaction.SIGHASH_ALL
    );
    console.log("✅ Transaction and hashForSignature created");

    console.log("🔄 Executing Lit Action...");
    const litActionResponse = await litNodeClient.executeJs({
      code: litActionCode,
      sessionSigs,
      jsParams: {
        toSign: sighash,
        publicKey: PKP_PUBLIC_KEY,
      },
    });
    console.log("✅ Lit Action executed");

    if (litActionResponse.response === "Block height is even! Don't sign!") {
      return "Block height was even; transaction not signed.";
    }

    console.log("🔄 Converting the signature from Ethereum-like to Bitcoin-like...");
    let r = Buffer.from(litActionResponse.signatures.btcSignature.r, "hex");
    let s = Buffer.from(litActionResponse.signatures.btcSignature.s, "hex");
    let rBN = new BN(r);
    let sBN = new BN(s);

    const secp256k1 = new EC("secp256k1");
    const n = secp256k1.curve.n;

    if (sBN.cmp(n.divn(2)) === 1) {
      sBN = n.sub(sBN);
    }

    r = rBN.toArrayLike(Buffer, "be", 32);
    s = sBN.toArrayLike(Buffer, "be", 32);

    function ensurePositive(buffer: Buffer) {
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
    console.log("✅ Signature converted");

    console.log("🔄 Setting the input script...");
    const signatureWithHashType = Buffer.concat([
      derSignature,
      Buffer.from([bitcoin.Transaction.SIGHASH_ALL]),
    ]);

    const scriptSig = bitcoin.script.compile([
      signatureWithHashType,
      Buffer.from(PKP_PUBLIC_KEY, "hex"),
    ]);

    tx.setInputScript(0, scriptSig);
    console.log("✅ Input script set");

    const txHex = tx.toHex();

    console.log("🔄 Broadcasting transaction...");
    const broadcastTransaction = async (txHex: string) => {
      try {
        const response = await fetch(BROADCAST_URL, {
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
      } catch (error: any) {
        console.error(error.message);
      }
    };

    return broadcastTransaction(txHex);
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
