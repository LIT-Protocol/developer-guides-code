"use client";
import { useState } from "react";
import type { Operation } from "@/types/operation";
import { useOperation } from "@/hooks/useOperation";
import { getSessionSigsLitAction } from "../../../../session-signatures/getLitActionSessionSigs/src/index";
import { getSessionSigsPKP } from "../../../../session-signatures/getPkpSessionSigs/src/index";
import { getSessionSigsViaAuthSig } from "../../../../session-signatures/getSessionSigs/src/index";

const OPERATIONS: Operation[] = [
    {
        id: "lit-action",
        name: "Get Session Sigs Lit Action",
        handler: getSessionSigsLitAction,
    },
    {
        id: "pkp",
        name: "Get Session Sigs PKP",
        handler: getSessionSigsPKP,
    },
    {
        id: "auth-sig",
        name: "Get Session Sigs Via AuthSig",
        handler: getSessionSigsViaAuthSig,
    },
];

export default function SessionSigs() {
    const [activeOperation, setActiveOperation] = useState<string | null>(null);
    const { state, executeOperation } = useOperation();

    const handleOperation = async (operation: Operation) => {
        setActiveOperation(operation.id);
        await executeOperation(operation.handler);
    };

    return (
        <div className="flex flex-col items-center gap-[1.2rem]">
            <h2 className="text-xl font-semibold mb-4">Session Signatures</h2>

            {OPERATIONS.map((operation) => (
                <div key={operation.id} className="w-full max-w-md">
                    <button
                        onClick={() => handleOperation(operation)}
                        disabled={state.loading}
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
