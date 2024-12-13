"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <div className="relative flex justify-center p-4">
            <Link href="/" className="absolute left-4 hover:text-gray-600">
                Home
            </Link>
            <div className="flex flex-col items-center gap-[0.2rem]">
                <h1 className="text-2xl font-bold">Lit SDK with NextJs</h1>
                <p>(Open console for logs)</p>
            </div>
        </div>
    );
}
