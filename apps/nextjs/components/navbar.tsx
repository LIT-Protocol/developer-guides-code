"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <div className="relative flex items-center justify-center p-4">
            <Link href="/" className="absolute left-4 hover:text-gray-600">
                Home
            </Link>
            <h1 className="text-2xl font-bold">Next with Lit</h1>
        </div>
    );
}