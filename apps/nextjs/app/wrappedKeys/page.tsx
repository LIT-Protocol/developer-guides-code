/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import * as ethers from "ethers";
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import { runExample } from "../../../../wrapped-keys/eip-712/nodejs/src/index";
import { mintPkp } from "../../../../wrapped-keys/nodejs/src/utils";
import { generateWrappedKey } from "../../../../wrapped-keys/nodejs/src/generateWrappedKey";
import { signTransactionWithWrappedKey } from "../../../../wrapped-keys/nodejs/src/signTransactionWithWrappedKey";

export default function Home() {
    async function callFunction1() {
        console.log("EIP 712 Signing");
        const domain = {
            name: "Ether Mail",
            version: "1",
            chainId: 1,
            verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        };
        const types = {
            Person: [
                { name: "name", type: "string" },
                { name: "wallet", type: "address" },
            ],
            Mail: [
                { name: "from", type: "Person" },
                { name: "to", type: "Person" },
                { name: "contents", type: "string" },
            ],
        };
        const message = {
            from: {
                name: "Alice",
                wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
            },
            to: {
                name: "Bob",
                wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
            },
            contents: "Hello, Bob!",
        };

        const typedData = {
            domain,
            types,
            primaryType: "Mail",
            message,
        };
        const serializedEip712Message = JSON.stringify(typedData);
        const response = await runExample(serializedEip712Message, true);
        console.log(response);
    }

    async function callFunction2() {
        console.log("Sign Transaction with Wrapped Key on Ethereum");
        const ETHEREUM_PRIVATE_KEY =
            process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY;
        if (!ETHEREUM_PRIVATE_KEY) {
            throw new Error("NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY is not defined");
        }
        const ethersSigner = new ethers.Wallet(
            ETHEREUM_PRIVATE_KEY,
            new ethers.providers.JsonRpcProvider(
                `https://yellowstone-rpc.litprotocol.com`
            )
        );
        const mintedPkp = await mintPkp(ethersSigner);
        const generateWrappedKeyResponse = await generateWrappedKey(
            mintedPkp!.publicKey,
            "evm",
            "This is a Dev Guide code example testing Ethereum key"
        );
        const litTransaction = {
            chainId: 175177,
            chain: "chronicleTestnet",
            toAddress: ethersSigner.address,
            value: "0.0001",
            // Manually specifying because the generated private key doesn't hold a balance and ethers
            // fails to estimate gas since the tx simulation fails with insufficient balance error
            gasLimit: 21_000,
        };

        if (!generateWrappedKeyResponse) {
            throw new Error("generateWrappedKeyResponse is undefined");
        }
        const signedTransaction = await signTransactionWithWrappedKey(
            mintedPkp!.publicKey,
            "evm",
            generateWrappedKeyResponse.id,
            litTransaction,
            false
        );
        console.log(signedTransaction);
    }

    async function callFunction3() {
        console.log("Sign Transaction with Wrapped Key on Solana");
        const ETHEREUM_PRIVATE_KEY =
            process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY;
        if (!ETHEREUM_PRIVATE_KEY) {
            throw new Error("NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY is not defined");
        }
        const ethersSigner = new ethers.Wallet(
            ETHEREUM_PRIVATE_KEY,
            new ethers.providers.JsonRpcProvider(
                `https://yellowstone-rpc.litprotocol.com`
            )
        );
        const mintedPkp = await mintPkp(ethersSigner);

        const generateWrappedKeyResponse = await generateWrappedKey(
            mintedPkp!.publicKey,
            "solana",
            "This is a Dev Guide code example testing Solana key"
        );

        if (!generateWrappedKeyResponse) {
            throw new Error("generateWrappedKeyResponse is undefined");
        }
        const generatedSolanaPublicKey = new PublicKey(
            generateWrappedKeyResponse.generatedPublicKey
        );

        const solanaTransaction = new Transaction();
        solanaTransaction.add(
            SystemProgram.transfer({
                fromPubkey: generatedSolanaPublicKey,
                toPubkey: generatedSolanaPublicKey,
                lamports: LAMPORTS_PER_SOL / 100, // Transfer 0.01 SOL
            })
        );
        solanaTransaction.feePayer = generatedSolanaPublicKey;

        const solanaConnection = new Connection(
            clusterApiUrl("devnet"),
            "confirmed"
        );
        const { blockhash } = await solanaConnection.getLatestBlockhash();
        solanaTransaction.recentBlockhash = blockhash;

        const serializedTransaction = solanaTransaction
            .serialize({
                requireAllSignatures: false, // should be false as we're not signing the message
                verifySignatures: false, // should be false as we're not signing the message
            })
            .toString("base64");

        const litTransaction = {
            serializedTransaction,
            chain: "devnet",
        };

        const signedTransaction = await signTransactionWithWrappedKey(
            mintedPkp!.publicKey,
            "solana",
            generateWrappedKeyResponse.id,
            litTransaction,
            false
        );
        console.log(signedTransaction)
    }

    return (
        <div className="flex flex-col items-center gap-[1.2rem]">
            <p>Check console</p>
            <button
                onClick={callFunction1}
                className="bg-gray-700 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:shadow-outline"
            >
                Generate Wrapped Key and Sign a EIP 712 Message
            </button>
            <button
                onClick={callFunction2}
                className="bg-gray-700 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:shadow-outline"
            >
                Generate Wrapped Key and Sign Ethereum Transaction
            </button>
            <button
                onClick={callFunction3}
                className="bg-gray-700 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:shadow-outline"
            >
                Generate Wrapped Key and Sign Solana Transaction
            </button>
        </div>
    );
}
