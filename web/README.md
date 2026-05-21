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

## Vercel deployment

1. **Root Directory:** `web`
2. **Env vars:** copy from [`web/.env.example`](.env.example) — full guide: [`docs/vercel-deployment.md`](../docs/vercel-deployment.md)
3. **Checklist:** [`scripts/vercel-env-checklist.md`](scripts/vercel-env-checklist.md)

**Minimum on Vercel:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STELLAR_FUNDER_SECRET`, `STELLAR_MSME_SECRET`, `STELLAR_ISSUER_SECRET` (+ recommended contract IDs from `.env.example`).
