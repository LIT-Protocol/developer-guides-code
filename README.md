# Lit Developer Code Guides

This repository works in conjunction with the [Lit Build Docs](https://docs-olive-ten.vercel.app/build), and contains code examples for various Lit functionalities.

## Creating a New Code Guide

### Generating a New Code Directory

```bash
npx nx g templates:nodejs
```

This will run the NX generator for the Node.js template, and create a new directory under a selected category

### Running All the Tests

```bash
yarn test:all
```

### Running the Tests for a Specific Code Guide

```bash
yarn workspace name-of-code-guide test
```
