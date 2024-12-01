/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import { signAndCombineAndSendTx } from "../../../../sign-and-combine-ecdsa/nodejs/src/index";

export default function Home() {
    const [resF1, setResF1] = useState(false);

    async function callFunction1() {
        const result = await signAndCombineAndSendTx();
        console.log(result);
        if (result?.success == true) {
            setResF1(true);
        }
    }

    return (
        <div className="flex flex-col items-center gap-[1.2rem]">
            <p>Check console</p>
            <button
                onClick={callFunction1}
                className="bg-gray-700 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:shadow-outline"
            >
                Demonstrate signAndCombineEcdsa on a Lit Action
            </button>
            {resF1 && <p>Operation Successful</p>}
        </div>
    );
}
