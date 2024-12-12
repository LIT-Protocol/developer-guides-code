"use client";
import type { Operation } from "@/types/operation";
import { useOperation } from "@/hooks/useOperation";
import { delegateCapacityCredit } from "../../../../paying-for-lit/nodejs/src/delegateCapacityCredit";
import { getSessionSigsWithCapacityCreditAuthSig } from "../../../../paying-for-lit/nodejs/src/getSessionSigsWithCapacityCreditAuthSig";
import { mintCapacityCredit } from "../../../../paying-for-lit/nodejs/src/mintCapacityCredit";

const OPERATIONS: Operation[] = [
    {
        id: "solanaOpenAI",
        name: "Solana OpenAI Example",
        handler: delegateCapacityCredit,
    },
    {
        id: "solanaOpenAI",
        name: "Solana OpenAI Example",
        handler: getSessionSigsWithCapacityCreditAuthSig,
    },
    {
        id: "solanaOpenAI",
        name: "Solana OpenAI Example",
        handler: mintCapacityCredit,
    },
];

export default function SignAndCombine() {
    const { state, executeOperation } = useOperation();

    return (
        <div className="flex flex-col items-center gap-[1.2rem]">
            <h2 className="text-xl font-semibold mb-4">Solana OpenAI</h2>

            {OPERATIONS.map((operation) => (
                <div key={operation.id} className="w-full max-w-md">
                    <button
                        onClick={() => executeOperation(operation.handler)}
                        disabled={state.loading}
                        data-testid={`button-${operation.id}`}
                        className={`w-full bg-gray-700 text-white font-bold py-2 px-4 rounded
                            ${
                                state.loading
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-600"
                            } 
                            focus:outline-none focus:shadow-outline`}
                    >
                        {state.loading ? "Processing..." : operation.name}
                    </button>

                    {state.loading && (
                        <p
                            data-testid={`loading-${operation.id}`}
                            className="text-blue-500 mt-2"
                        >
                            Processing...
                        </p>
                    )}

                    {state.success && (
                        <p
                            data-testid={`success-${operation.id}`}
                            className="text-green-500 mt-2"
                        >
                            Operation Successful
                        </p>
                    )}

                    {state.error && (
                        <p
                            data-testid={`error-${operation.id}`}
                            className="text-red-500 mt-2"
                        >
                            {state.error}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
