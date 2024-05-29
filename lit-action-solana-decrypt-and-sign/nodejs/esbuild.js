import * as esbuild from "https://deno.land/x/esbuild@v0.20.1/mod.js";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.10.3";

esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: ["src/litAction_solana.js"],
  bundle: true,
  minify: false,
  sourcemap: false,
  outdir: "dist/",
  platform: "browser",
  format: "esm",
  target: "esnext",
  inject: ["./bufferShim.js"],
});
await esbuild.stop();
