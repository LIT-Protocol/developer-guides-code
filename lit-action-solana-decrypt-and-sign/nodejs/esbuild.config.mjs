import { build, analyzeMetafile } from "esbuild";

const go = async () => {
  await build({
    entryPoints: ["./src/litAction.js"],
    bundle: true,
    minify: false,
    sourcemap: false,
    outfile: "./dist/bundle.js",
    inject: ["./buffer-shim.js"],
  });
};

go();
