import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import mempoolJS from "@mempool/mempool.js";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

import { convertSignature, broadcastTransaction } from "../utils/utils";
import { litActionCode } from "../utils/litAction";

bitcoin.initEccLib(ecc);

export async function collaborativeMultiSig(litNodeClient: LitNodeClient, sessionSigs: any, pkpPublicKey1: string, pkpPublicKey2: string, destinationAddress: string) {
    const network = bitcoin.networks.bitcoin;
    const pubKeyBuffer_1 = Buffer.from(pkpPublicKey1, "hex");
    const pubKeyBuffer_2 = Buffer.from(pkpPublicKey2, "hex");

    const redeemScript1 = bitcoin.script.compile([
        pubKeyBuffer_1,
        bitcoin.opcodes.OP_CHECKSIG,
    ]);

    const redeemScript2 = bitcoin.script.compile([
        pubKeyBuffer_2,
        bitcoin.opcodes.OP_CHECKSIG,
    ]);

    const p2shPayment1 = bitcoin.payments.p2sh({
        redeem: { output: redeemScript1 },
        network: network,
    });
    console.log("P2SH Address 1:", p2shPayment1.address);

    const p2shPayment2 = bitcoin.payments.p2sh({
        redeem: { output: redeemScript2 },
        network: network,
    });
    console.log("P2SH Address 2:", p2shPayment2.address);

    const {
        bitcoin: { addresses, transactions },
    } = mempoolJS({
        hostname: "mempool.space",
        network: "mainnet",
    });

    const address1Utxos = await addresses.getAddressTxsUtxo({
        address: p2shPayment1.address!,
    });

    if (address1Utxos.length === 0) {
        console.log("No UTXOs found for address:", p2shPayment1.address);
        return;
    }

    const utxo1 = address1Utxos[0];

    const address2Utxos = await addresses.getAddressTxsUtxo({
        address: p2shPayment2.address!,
    });

    if (address2Utxos.length === 0) {
        console.log("No UTXOs found for address:", p2shPayment2.address);
        return;
    }

    const utxo2 = address2Utxos[0];

    const fee = 1000; // Adjust the fee as needed

    const utxoValue1 = utxo1.value;
    const utxoValue2 = utxo2.value;
    const totalInputValue = utxoValue1 + utxoValue2;
    const amountToSend = totalInputValue - fee;

    const psbt = new bitcoin.Psbt({ network });

    const utxo1RawTx = await transactions.getTxHex({ txid: utxo1.txid });
    const utxo2RawTx = await transactions.getTxHex({ txid: utxo2.txid });

    psbt.addInput({
        hash: utxo1.txid,
        index: utxo1.vout,
        nonWitnessUtxo: Buffer.from(utxo1RawTx, "hex"),
        redeemScript: redeemScript1,
    });

    psbt.addInput({
        hash: utxo2.txid,
        index: utxo2.vout,
        nonWitnessUtxo: Buffer.from(utxo2RawTx, "hex"),
        redeemScript: redeemScript2,
    });

    psbt.addOutput({
        address: destinationAddress,
        value: BigInt(amountToSend),
    });

    //@ts-ignore
    const tx = psbt.__CACHE.__TX.clone();
    const sighash1 = tx.hashForSignature(
        0,
        redeemScript1,
        bitcoin.Transaction.SIGHASH_ALL
    );

    const sighash2 = tx.hashForSignature(
        1,
        redeemScript2,
        bitcoin.Transaction.SIGHASH_ALL
    );

    const litActionResponse1 = await litNodeClient.executeJs({
        code: litActionCode,
        sessionSigs,
        jsParams: {
        publicKey: pkpPublicKey1,
        toSign: Buffer.from(sighash1, "hex"),
        },
    });

    const litActionResponse2 = await litNodeClient.executeJs({
        code: litActionCode,
        sessionSigs,
        jsParams: {
        publicKey: pkpPublicKey2,
        toSign: Buffer.from(sighash2, "hex"),
        },
    });

    const signatureWithHashType1 = await convertSignature(
        litActionResponse1.signatures.btcSignature
    );

    const signatureWithHashType2 = await convertSignature(
        litActionResponse2.signatures.btcSignature
    );

    psbt.updateInput(0, {
        finalScriptSig: bitcoin.script.compile([
        signatureWithHashType1,
        redeemScript1,
        ]),
    });

    psbt.updateInput(1, {
        finalScriptSig: bitcoin.script.compile([
        signatureWithHashType2,
        redeemScript2,
        ]),
    });

    const txHex = psbt.extractTransaction().toHex();
    return await broadcastTransaction(txHex);
}