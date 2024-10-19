# Getting started

```
npm install
```

## Start writing your Lit Action like a regular TS

- See demo in `./src/lit-actions/hello-world.ts`

## To build and bundle the TS Lit Action code

```
npm run build
```

This will build and bundle all files in `./src/lit-actions/*.ts`, and the output will be in `./src/lit-actions/dist`.

## Getting the bundled Lit Action Code

In your `./src/index.ts` file, you can import the bundled Lit Action code like this:

```ts
import { code } from "./lit-actions/dist/hello-world.js";

console.log("litActionCode:", code);
```

## output

```
npm run build

> lit-actions-ts-bundling@1.0.0 build
> node esbuild.config.js

🗂️  File: src/lit-actions/dist/hello-world.js
   Size: 0.0251 MB (decimal) | 0.0239 MB (binary)
================================================
✅ Lit actions built successfully in 0.02 seconds
```