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

## Output

```
npm run build

> lit-actions-ts-bundling@1.0.0 build
> node esbuild.config.js

🗂️  File: src/lit-actions/dist/hello-world.js
   Size: 0.0251 MB (decimal) | 0.0239 MB (binary)
================================================
✅ Lit actions built successfully in 0.02 seconds
```

## Features

### Lit Action global variables type definition

![](https://private-user-images.githubusercontent.com/4049673/378098250-19ef8b19-4b98-441b-b169-59a4f777131d.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjkzNTMzOTYsIm5iZiI6MTcyOTM1MzA5NiwicGF0aCI6Ii80MDQ5NjczLzM3ODA5ODI1MC0xOWVmOGIxOS00Yjk4LTQ0MWItYjE2OS01OWE0Zjc3NzEzMWQucG5nP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI0MTAxOSUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNDEwMTlUMTU1MTM2WiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9YjY3YjNlYjE5NzY2NmIyYjVlYzUzYTdhYWUyYmE0OGFjNWQ1ZDU2MWZkNDBlMGRkMDM5ZWVlYjZjMjdlMjI0OCZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QifQ.fqIXjfuEGGsx3htuQeroMnixM9L1Jtk5J1SipOn03HE)

## shim js file from the header

```ts
/**
 * My hello world Lit Action
 * 
 * inject ./buffer.shim.js
 */
```