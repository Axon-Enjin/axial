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

**Chain config:** the app runs on **Stellar Mainnet** — contract IDs resolve from `MAINNET_*` env vars (falling back to [`soroban/deployments/mainnet.json`](../soroban/deployments/mainnet.json)). On-chain operations need the `MAINNET_STELLAR_*_SECRET` keys — run `cd soroban && ./scripts/write-web-env.sh`.

## Deployment

**Primary (CI):** pushes to `main` build [`Dockerfile`](Dockerfile) and deploy to **Google Cloud Run** (`asia-southeast1`, service `axial-web`) via [`.github/workflows/deploy-cloudrun.yml`](../.github/workflows/deploy-cloudrun.yml). Env comes from GitHub Actions repo vars/secrets.

**Env vars:** copy from [`web/.env.example`](.env.example). Minimum for a working demo: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `MAINNET_STELLAR_FUNDER_SECRET`, `MAINNET_STELLAR_MSME_SECRET`, `MAINNET_STELLAR_ISSUER_SECRET` (+ recommended `MAINNET_*` contract IDs).
