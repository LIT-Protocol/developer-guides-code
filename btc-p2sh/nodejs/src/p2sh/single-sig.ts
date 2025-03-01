import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import mempoolJS from "@mempool/mempool.js";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

import { convertSignature, broadcastTransaction } from "../utils/utils";
import { litActionCode } from "../utils/litAction";

bitcoin.initEccLib(ecc);

export async function singleSig(litNodeClient: LitNodeClient, sessionSigs: any, pkpPublicKey: string, destinationAddress: string) {
    const network = bitcoin.networks.bitcoin;
    const pubKeyBuffer = Buffer.from(pkpPublicKey, "hex");

    const redeemScript = bitcoin.script.compile([
        pubKeyBuffer,
        bitcoin.opcodes.OP_CHECKSIG,
    ]);

    const p2shPayment = bitcoin.payments.p2sh({
        redeem: { output: redeemScript },
        network: network,
    });

    const { bitcoin: { addresses, transactions } } = mempoolJS({
        hostname: "mempool.space",
        network: "mainnet",
    });

    const addressUtxos = await addresses.getAddressTxsUtxo({
        address: p2shPayment.address!,
    });

    console.log("P2SH Address:", p2shPayment.address);

    if (addressUtxos.length === 0) {
        console.log("No UTXOs found for address:", p2shPayment.address);
        return;
    }

    const utxo = addressUtxos[0];
    const psbt = new bitcoin.Psbt({ network });
    const utxoRawTx = await transactions.getTxHex({ txid: utxo.txid });

    psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        nonWitnessUtxo: Buffer.from(utxoRawTx, "hex"),
        redeemScript: redeemScript,
    });

    const fee = 1000;
    const amountToSend = utxo.value - fee;

    psbt.addOutput({
        address: destinationAddress,
        value: BigInt(amountToSend),
    });

    //@ts-ignore
    const tx = psbt.__CACHE.__TX.clone();
    const sighash = tx.hashForSignature(
        0,
        redeemScript,
        bitcoin.Transaction.SIGHASH_ALL
    );

    const litActionResponse = await litNodeClient.executeJs({
        code: litActionCode,
        sessionSigs, 
        jsParams: {
        publicKey: pkpPublicKey,
        toSign: Buffer.from(sighash, "hex"),
        },
    });

    const signatureWithHashType = await convertSignature(
        litActionResponse.signatures.btcSignature
    );

    psbt.updateInput(0, {
        finalScriptSig: bitcoin.script.compile([
        signatureWithHashType,
        redeemScript,
        ]),
    });

    const txHex = psbt.extractTransaction().toHex();
    return await broadcastTransaction(txHex);
}