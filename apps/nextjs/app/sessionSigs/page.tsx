/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import * as ethers from "ethers";

import { getSessionSigsLitAction } from "../../../../session-signatures/getLitActionSessionSigs/src/index";
import { getSessionSigsPKP } from "../../../../session-signatures/getPkpSessionSigs/src/index";
import { getSessionSigsViaAuthSig } from "../../../../session-signatures/getSessionSigs/src/index";

export default function Home() {
    async function callFunction1() {
        const result = await getSessionSigsLitAction();
        console.log(result);
    }

    async function callFunction2() {
        const result = await getSessionSigsPKP();
        console.log(result);
    }

    async function callFunction3() {
        const result = await getSessionSigsViaAuthSig();
        console.log(result);
    }

    return (
        <div className="flex flex-col items-center gap-[1.2rem]">
            <p>Check console</p>
            <button
                onClick={callFunction1}
                className="bg-gray-700 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:shadow-outline"
            >
                getSessionSigsLitAction
            </button>
            <button
                onClick={callFunction2}
                className="bg-gray-700 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:shadow-outline"
            >
                getSessionSigsPKP
            </button>
            <button
                onClick={callFunction3}
                className="bg-gray-700 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:shadow-outline"
            >
                getSessionSigsViaAuthSig
            </button>
        </div>
    );
}
