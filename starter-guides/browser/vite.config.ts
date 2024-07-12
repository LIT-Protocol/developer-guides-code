import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
  },
   optimizeDeps: {
     esbuildOptions: {
       // Node.js global to browser globalThis
       define: {
         global: "globalThis",
       },
       // Enable esbuild polyfill plugins
       plugins: [
         NodeGlobalsPolyfillPlugin({
           process: true,
           buffer: true,
         }),
         NodeModulesPolyfillPlugin(),
       ],
     },
   },
});