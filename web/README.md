# Axial Web

Next.js 15 app — Command Center, Liquidity, Compliance, and Settings.

## Commands

From this directory:

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

Path alias `@/*` maps to this folder.

**Chain config:** reads [`soroban/deployments/testnet.json`](../soroban/deployments/testnet.json) automatically. Override via `.env.local`. On-chain UI swaps need `STELLAR_FUNDER_SECRET` — run `cd soroban && ./scripts/write-web-env.sh`.
