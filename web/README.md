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

## Deployment

**Primary (CI):** pushes to `main` build [`Dockerfile`](Dockerfile) and deploy to **Google Cloud Run** (`asia-southeast1`, service `axial-web`) via [`.github/workflows/deploy-cloudrun.yml`](../.github/workflows/deploy-cloudrun.yml). Env comes from GitHub Actions repo vars/secrets.

**Alternate:** Vercel — Root Directory `web`, config in [`vercel.json`](vercel.json). Full guide: [`docs/vercel-deployment.md`](../docs/vercel-deployment.md); env checklist: [`scripts/vercel-env-checklist.md`](scripts/vercel-env-checklist.md).

**Env vars:** copy from [`web/.env.example`](.env.example). Minimum for a working demo: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STELLAR_FUNDER_SECRET`, `STELLAR_MSME_SECRET`, `STELLAR_ISSUER_SECRET` (+ recommended contract IDs).
