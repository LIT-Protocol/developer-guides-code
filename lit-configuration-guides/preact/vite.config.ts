import { defineConfig } from 'vite';
import preact from '@preact/preset-vite'
// import inject from '@rollup/plugin-inject';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    preact(),
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

      ]
    }
  }
});