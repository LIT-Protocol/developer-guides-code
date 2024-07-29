import esbuild from "esbuild";

(async () => {
  await esbuild.build({
    entryPoints: ["./src/sendSignedSolTx.ts"],
    bundle: true,
    minify: true,
    sourcemap: false,
    outdir: "./src/lib/litActions/solana/dist",
    inject: ["./buffer.shim.js"],
  });
})();
