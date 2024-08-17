import * as esbuild from "https://deno.land/x/esbuild@v0.20.1/mod.js";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.10.3";

esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: ["src/litAction.js"],
  outdir: "dist-lit-action/",
  bundle: true,
  platform: "browser",
  format: "esm",
  target: "esnext",
  minify: false,
  inject: [],
});
await esbuild.stop();
