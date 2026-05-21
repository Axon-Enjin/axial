# Deploy Axial Web to Vercel

Use this checklist when deploying the hackathon demo. All env vars are set in the **Vercel project** (not committed).

## 1. Vercel project settings

| Setting | Value |
|---------|--------|
| **Root Directory** | `web` |
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` (default) |
| **Install Command** | `npm install` (default) |
| **Output Directory** | `.next` (default) |
| **Node.js Version** | 20.x or 22.x |

Deploy from the monorepo root (`axial/`) so `../soroban/deployments/testnet.json` is available as a fallback. Do **not** deploy only the `web` folder as a separate repo unless you copy contract IDs into env (section 2).

**Region:** `sin1` (Singapore) is set in `web/vercel.json` for lower latency to PH + Stellar testnet.

---

## 2. Environment variables (copy into Vercel)

In **Project → Settings → Environment Variables**, add for **Production** (and **Preview** if you want branch deploys).

### Required — sensitive

| Variable | Where to get it |
|----------|-----------------|
| `SUPABASE_URL` | `https://ifzyntqwymmgimnxtguz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → **service_role** (secret) |
| `STELLAR_FUNDER_SECRET` | Local: `stellar keys secret treasury-key` after team deploy, or `soroban/scripts/write-web-env.sh` |
| `STELLAR_MSME_SECRET` | Local: `stellar keys secret my-key` |
| `STELLAR_ISSUER_SECRET` | Local: `stellar keys secret admin-key` |

Without Supabase, invoice/EIS data uses ephemeral serverless disk and **will not persist** across requests.

Without the three `STELLAR_*_SECRET` values, **Tokenize & Swap**, **Route Payroll**, and **EIS memo write-back** will fail.

### Recommended — plain (chain / contracts)

Paste from `soroban/deployments/testnet.json` or `web/.env.example`:

```
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

AXIAL_SWAP_CONTRACT_ID=CDDAIDM4D62OZL5MQPKO5ZFWE7TBRFJD5Y3L2UZKP5OVGP2VHZ2UU736
RECEIVABLE_TOKEN_CONTRACT_ID=CAQEEFBO44FONQKGCEHR2QFTLOIIO232Z7WM6722ZDA6MNAL2NNU7SOP
PAYROLL_SPLIT_CONTRACT_ID=CBJCEJMDGRGLVU7VHAFR2VSVSBIKIWZA6LBQN6SCLZVJU6YROTETY3MB
SOROBAN_USDC_TOKEN_ID=CDECR6Z4KYGUHCJG3IBQSCLUN3NZQGUXCZRQLPAWBZ7GFN4I5ZBUDODS

STELLAR_ISSUER_PUBLIC=GD67NPG7TKJDE5HEHSPWS3YAWYNHWTLWRSQMTO4NQOVSZAEFPICO3HYG
STELLAR_FUNDER_PUBLIC=GBRLGRWUJXJSHJDZQ4OH2SDH7ROF7EWAHI4ZIQM2E6TMONH7IG4P7QKL
STELLAR_MSME_PUBLIC=GBCVJCRULTHI74CXNP4QFGE6OSK5XFUYIPPEONRNXS3JQSKA26TDAR66
```

If these are omitted, the app reads `../soroban/deployments/testnet.json` when the full repo is deployed with Root Directory `web`.

### Optional — demo metadata

| Variable | Default if unset |
|----------|------------------|
| `EIS_JWS_MOCK_SECRET` | `axial-hackathon-eis-mock-key` |
| `AXIAL_ORG_ID` | `demo-msme` |
| `AXIAL_SELLER_TIN` / `NAME` / `ADDRESS` | Demo MSME values |
| `AXIAL_BUYER_TIN` / `NAME` / `ADDRESS` | Demo buyer values |

### Preview / hackathon demo only

| Variable | When to use |
|----------|-------------|
| `AXIAL_ALLOW_SEED=true` | Empty Liquidity table on first load; enables `POST /api/invoices/seed`. **Do not use on a public production URL** you care about. |

`NODE_ENV` is set automatically by Vercel (`production`).

---

## 3. Quick copy from local `.env.local`

If you already run locally with `web/.env.local` from `write-web-env.sh`:

1. Open Vercel → Environment Variables → **Import .env** (or paste one-by-one).
2. Upload `web/.env.local` **only in the Vercel UI** — never commit it to git.
3. Remove any keys you do not need; ensure all **Required** rows above are present.

---

## 4. Supabase (one-time)

Migrations must already be applied on project `ifzyntqwymmgimnxtguz`:

- `eis_submissions`
- `factoring_invoices`

If tables are missing, run migrations via Supabase SQL editor or MCP (see repo `supabase/migrations/`).

After deploy, seed once (with `AXIAL_ALLOW_SEED=true` or from local):

```bash
curl -X POST "https://YOUR_APP.vercel.app/api/invoices/seed?force=true"
curl -X POST "https://YOUR_APP.vercel.app/api/eis/seed"
```

---

## 5. Post-deploy smoke test

| Check | URL / action |
|-------|----------------|
| Chain status | `GET /api/soroban/status` → `onChainReady: true` |
| Dashboard | `GET /api/dashboard/summary` → 200, `invoiceStore: "supabase"` |
| Liquidity | Open `/liquidity` — invoice rows load |
| Swap | Confirm payer → Tokenize & Swap (funder needs testnet USDC) |
| Compliance | `GET /api/eis/submissions` → rows after swap |

**OCR upload** (`POST /api/invoices/parse`) uses Tesseract + pdf-parse; `maxDuration` is 60s in `vercel.json`. Hobby plan may cap lower — use image uploads if PDF parse times out.

---

## 6. Security notes

- Treat `SUPABASE_SERVICE_ROLE_KEY` and all `STELLAR_*_SECRET` as **production secrets**.
- `SUPABASE_ANON_KEY` alone is insufficient for server writes; use **service_role** on Vercel.
- Never commit `.env.local` or paste secrets into GitHub issues/PRs.
- Rotate keys if they were ever committed.

---

## 7. CLI deploy (optional)

From repo root, with [Vercel CLI](https://vercel.com/docs/cli) linked:

```bash
cd web
vercel link
vercel env pull .env.vercel.local   # optional local preview of remote env
vercel --prod
```

Set env vars in the dashboard first, or:

```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

---

*Contract IDs and public keys: update when you redeploy Soroban testnet (`soroban/deployments/testnet.json`).*
