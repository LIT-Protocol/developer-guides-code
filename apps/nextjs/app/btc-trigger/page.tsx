"use client";
import type { Operation } from "@/types/operation";
import { useOperation } from "@/hooks/useOperation";
import { executeBtcSigning } from "../../../../btc-trigger/nodejs/src/index";

const OPERATIONS: Operation[] = [
    {
        id: "btc-trigger",
        name: "Demonstrate a BTC Signature when an API response is according to a condition",
        handler: executeBtcSigning,
    },
];

export default function BtcTrigger() {
    const { state, executeOperation } = useOperation();

    return (
        <div className="flex flex-col items-center gap-[1.2rem]">
            <h2 className="text-xl font-semibold mb-4">BTC Trigger</h2>

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
