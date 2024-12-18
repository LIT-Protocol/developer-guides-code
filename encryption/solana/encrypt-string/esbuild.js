import * as esbuild from 'https://deno.land/x/esbuild@v0.20.1/mod.js';
import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader@^0.10.3';

esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: [
    'src/litActions/litActionSessionSigs.ts',
    'src/litActions/litActionDecrypt.ts',
  ],
  outdir: 'src/litActions/dist/',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'esnext',
  minify: false,
  inject: ['./esbuild-shims.js'],
});
await esbuild.stop();
