# Welcome to Lit's Developer Guide Code Repository

These examples are designed to help you get started building with Lit!

Each example has instructions within its own README file!

## Setup

```
yarn install
```

For Browser examples, you need to create a `.env.local` file inside nextjs app.

```
cd apps/nextjs
cp .env.local.example .env.local
```

For Nodejs examples, you need to create a `.env` file inside selected example.

```
cp .env.example .env
```

## Test

Run the nodejs tests for all examples

```
yarn test:node
```

Run the browser tests for all examples

```
yarn test:browser
```

## Browser

Run all supported browser examples in nextjs

```
cd apps/nextjs
yarn dev
```
