import { build, stop } from "esbuild";

build({
  entryPoints: ["./src/litAction.js"],
  bundle: true,
  minify: false,
  sourcemap: false,
  outfile: "./dist/bundle.js",
  inject: ["./buffer-shim.js"],
});
await stop();
