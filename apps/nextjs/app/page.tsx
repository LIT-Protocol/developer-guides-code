"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center gap-[1.2rem]">
            <Link href="/sign-and-combine">
                <p className="flex items-center gap-2">
                    <span>Sign and Combine</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
            <Link href="/session-signatures">
                <p className="flex items-center gap-2">
                    <span>Session Sigs</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
            <Link href="/wrapped-keys">
                <p className="flex items-center gap-2">
                    <span>Wrapped Keys</span>
                    <ArrowRight className="w-4 h-4" />
                </p>
            </Link>
        </div>
    );
}
