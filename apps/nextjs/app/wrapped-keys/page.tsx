"use client";
import { useState } from "react";
import { ethers } from "ethers";
import {
    Connection,
    clusterApiUrl,
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import type { Operation } from "@/types/operation";
import { useOperation } from "@/hooks/useOperation";
import { runExample } from "../../../../wrapped-keys/eip-712/nodejs/src/index";
import { mintPkp } from "../../../../wrapped-keys/nodejs/src/utils";
import { generateWrappedKey } from "../../../../wrapped-keys/nodejs/src/generateWrappedKey";
import { signTransactionWithWrappedKey } from "../../../../wrapped-keys/nodejs/src/signTransactionWithWrappedKey";

// Helper function to set up Ethereum signer
const getEthersSigner = () => {
    const ETHEREUM_PRIVATE_KEY = process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY;
    if (!ETHEREUM_PRIVATE_KEY) {
        throw new Error("NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY is not defined");
    }
    return new ethers.Wallet(
        ETHEREUM_PRIVATE_KEY,
        new ethers.providers.JsonRpcProvider(
            "https://yellowstone-rpc.litprotocol.com"
        )
    );
};

const OPERATIONS: Operation[] = [
    {
        id: "eip-712",
        name: "Generate Wrapped Key and Sign a EIP 712 Message",
        handler: async () => {
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

            const typedData = { domain, types, primaryType: "Mail", message };
            return runExample(JSON.stringify(typedData), true);
        },
    },
    {
        id: "ethereum",
        name: "Generate Wrapped Key and Sign Ethereum Transaction",
        handler: async () => {
            const ethersSigner = getEthersSigner();
            const mintedPkp = await mintPkp(ethersSigner);
            if (!mintedPkp) throw new Error("Failed to mint PKP");

            const wrappedKeyResponse = await generateWrappedKey(
                mintedPkp.publicKey,
                "evm",
                "This is a Dev Guide code example testing Ethereum key"
            );
            if (!wrappedKeyResponse)
                throw new Error("Failed to generate wrapped key");

            const litTransaction = {
                chainId: 175177,
                chain: "chronicleTestnet",
                toAddress: ethersSigner.address,
                value: "0.0001",
                gasLimit: 21_000,
            };

            return signTransactionWithWrappedKey(
                mintedPkp.publicKey,
                "evm",
                wrappedKeyResponse.id,
                litTransaction,
                false
            );
        },
    },
    {
        id: "solana",
        name: "Generate Wrapped Key and Sign Solana Transaction",
        handler: async () => {
            const ethersSigner = getEthersSigner();
            const mintedPkp = await mintPkp(ethersSigner);
            if (!mintedPkp) throw new Error("Failed to mint PKP");

            const wrappedKeyResponse = await generateWrappedKey(
                mintedPkp.publicKey,
                "solana",
                "This is a Dev Guide code example testing Solana key"
            );
            if (!wrappedKeyResponse)
                throw new Error("Failed to generate wrapped key");

            const generatedSolanaPublicKey = new PublicKey(
                wrappedKeyResponse.generatedPublicKey
            );

            const solanaTransaction = new Transaction();
            solanaTransaction.add(
                SystemProgram.transfer({
                    fromPubkey: generatedSolanaPublicKey,
                    toPubkey: generatedSolanaPublicKey,
                    lamports: LAMPORTS_PER_SOL / 100,
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
                    requireAllSignatures: false,
                    verifySignatures: false,
                })
                .toString("base64");

            const litTransaction = {
                serializedTransaction,
                chain: "devnet",
            };

            return signTransactionWithWrappedKey(
                mintedPkp.publicKey,
                "solana",
                wrappedKeyResponse.id,
                litTransaction,
                false
            );
        },
    },
];

export default function WrappedKeys() {
    const [activeOperation, setActiveOperation] = useState<string | null>(null);
    const { state, executeOperation } = useOperation();

    const handleOperation = async (operation: Operation) => {
        setActiveOperation(operation.id);
        await executeOperation(operation.handler);
    };

    return (
        <div className="flex flex-col items-center gap-[1.2rem]">
            <h2 className="text-xl font-semibold mb-4">
                Wrapped Keys Operations
            </h2>

            {OPERATIONS.map((operation) => (
                <div key={operation.id} className="w-full max-w-md">
                    <button
                        onClick={() => handleOperation(operation)}
                        disabled={state.loading && activeOperation === operation.id}
                        data-testid={`button-${operation.id}`}
                        className={`w-full bg-gray-700 text-white font-bold py-2 px-4 rounded
                            ${
                                state.loading &&
                                activeOperation === operation.id
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-600"
                            } 
                            focus:outline-none focus:shadow-outline`}
                    >
                        {state.loading && activeOperation === operation.id
                            ? "Processing..."
                            : operation.name}
                    </button>

                    {activeOperation === operation.id && (
                        <div className="mt-2">
                            {state.loading && (
                                <p
                                    data-testid={`loading-${operation.id}`}
                                    className="text-blue-500"
                                >
                                    Processing...
                                </p>
                            )}

                            {state.success && (
                                <p
                                    data-testid={`success-${operation.id}`}
                                    className="text-green-500"
                                >
                                    Operation Successful
                                </p>
                            )}

                            {state.error && (
                                <p
                                    data-testid={`error-${operation.id}`}
                                    className="text-red-500"
                                >
                                    {state.error}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}