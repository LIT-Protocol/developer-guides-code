"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center gap-[1.2rem]">
            <Link href="/btc-trigger">
                <p className="flex items-center gap-2">
                    <span>BTC Trigger</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>

            <Link href="/conditional-signing">
                <p className="flex items-center gap-2">
                    <span>Conditional Signing</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
            <Link href="/decrypt-api-key-in-action">
                <p className="flex items-center gap-2">
                    <span>Decrypt API Key in Action</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
            <Link href="/eip-191-signing">
                <p className="flex items-center gap-2">
                    <span>EIP-191-Signing</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
            <Link href="/encryption">
                <p className="flex items-center gap-2">
                    <span>Encryption</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
            <Link href="/lit-action-claim-key">
                <p className="flex items-center gap-2">
                    <span>Lit Action Claim Key</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
            <Link href="/lit-action-using-fetch">
                <p className="flex items-center gap-2">
                    <span>Lit Action using fetch</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
            <Link href="/paying-for-lit">
                <p className="flex items-center gap-2">
                    <span>Paying for Lit</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
            <Link href="/session-signatures">
                <p className="flex items-center gap-2">
                    <span>Session Signatures</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
            <Link href="/sign-and-combine">
                <p className="flex items-center gap-2">
                    <span>Sign and Combine</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
            {/* <Link href="/solana-openai">
                <p className="flex items-center gap-2">
                    <span>Solana Open AI</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link> */}
            <Link href="/wrapped-keys">
                <p className="flex items-center gap-2">
                    <span>Wrapped Keys</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
        </div>
    );
}
