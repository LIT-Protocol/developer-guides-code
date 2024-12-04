import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
    plugins: [
        react(),
        nodePolyfills()
    ],
    resolve: {
        alias: {
            buffer: 'buffer/',
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            vm: 'vm-browserify',
        },
    },
    build: {
        rollupOptions: {
            plugins: [
                inject({
                    Buffer: ['buffer', 'Buffer']
                })
            ]
        }
    }
});