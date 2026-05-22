# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Axial Is

Axial is a liquidity and compliance engine for Philippine MSMEs. It solves two structural problems simultaneously: a $221B cash-flow gap caused by Net 60–90 B2B payment terms, and manual, error-prone BIR/statutory compliance. The value proposition is **"Instant Capital, Invisible Compliance"** — founders unlock cash from tokenized receivables via Stellar/Soroban atomic swaps while BIR EIS submissions and SSS/PhilHealth/Pag-IBIG payroll splits happen automatically in the background.

All regulatory and legal questions are **Philippines-jurisdiction-first**.

**Built for:** Build on Stellar Philippines Hackathon 2026 (May 18–24). Three devs, seven days.

## Development Commands

Frontend — from `web/`:

```bash
npm install
npm run dev     # Dev server with Turbopack (http://localhost:3000)
npm run build   # Production build (next build --turbopack)
npm run lint    # ESLint
npm start       # Production server
```

There is no test runner in `web/` — verify changes by running the dev server.

Soroban — build/deploy from **WSL** (Stellar CLI + Rust live there; repo is on the Windows drive). The repo is at `D:\PROJECTS\axial`, i.e. `/mnt/d/PROJECTS/axial` in WSL. See `soroban/README.md`, `soroban/CONTRIBUTING.md`, `soroban/CONTRACTS.md`.

```bash
cd /mnt/d/PROJECTS/axial/soroban
make setup           # first-time: network + .env + fund test identity
make build           # all 4 crates → target/wasm32v1-none/release/*.wasm
make test            # cargo test (host env)
make fmt             # cargo fmt --all
make deploy-all      # deploy all crates (after keys funded)
make testnet-demo    # full testnet deploy + write web env (~3 min)
```

A single contract's tests: `cd soroban/contracts/<crate> && cargo test`, or `cargo test -p <crate>` from `soroban/`.

## Architecture

### Repository Layout

```
axial/
├── soroban/      # Rust/Soroban workspace — 4 contract crates (build/deploy from WSL)
├── web/          # Next.js 15 App Router — UI + API routes + backend logic
├── supabase/     # SQL migrations for the hosted Supabase project
├── docs/         # Product docs: Axial.md (canonical), flow.md, pitch-deck.html, brd/prd/sdd/dsd/gtm, rfc-*
├── scripts/      # Tooling (pitch-deck PDF generation)
└── claude-design/ # Design scratch — design system + UI-kit exports, not wired into the app
```

### Frontend + Backend live together in `web/`

The "backend" is **Next.js Route Handlers under `web/app/api/`** — there is no separate server. The SDD's modular-monolith / BullMQ-Temporal plan was not adopted; ignore it as a build target.

`docs/flow.md` (built/mock/planned matrix) and the **"Implementation status" table in `docs/Axial.md`** are useful maps but **lag the code** — when they conflict with what's in `web/`, trust the code. As of this writing the following are built and wired: the 4 Soroban contracts (3 deployed to testnet — see below), USDC atomic swap, payroll split, BIR EIS oracle, the T+3 retry worker + Horizon poll + reconciliation cron jobs, Supabase auth with org-scoped multi-tenancy, the payer portal, NoA issue/ack, and Reflector FX with a hardcoded fallback. **Still not built:** mainnet deploy, on-chain settlement enforcement (the `settlement` contract crate exists but is not deployed — `SETTLEMENT_CONTRACT_ID` is unset), live BIR submission (mock by default — `BIR_EIS_LIVE` gates it), and real PDAX Connect calls.

**Stack:** Next.js 15.5 · React 19 · TypeScript 5 (strict) · Tailwind CSS 4 · `@stellar/stellar-sdk` · `@supabase/supabase-js` + `@supabase/ssr` (auth) · `tesseract.js` + `pdf-parse` + `sharp` (invoice OCR) · `stellar-hd-wallet` (key derivation). Path alias `@/*` → `web/*`.

**Pages (`web/app/`):**
- Root `layout.tsx` — just `<html>`, Geist fonts, Material Symbols. No shell.
- `page.tsx` — public marketing landing at `/`.
- `(auth)/` route group — `login` and `invite` pages with their own minimal layout; `auth/callback/route.ts` handles the Supabase OAuth code exchange.
- `app/app/layout.tsx` — the authenticated **AppShell** layout (renders `AppShell`, resolves chain status + auth user server-side). Tabs under `/app/*`: `app/page.tsx` (Overview), `liquidity/`, `compliance/`, `settings/`, plus `payer-portal/` (token-authenticated, outside the org session).

Each page is a thin wrapper that renders a view from `components/views/` (`OverviewView`, `LiquidityView`, `PayerPortalView`, etc.). `components/stitch/` holds older design-export versions of those views — `components/views/` is the live set. Shared shell in `components/layout/`, primitives in `components/ui/`, client state via `components/providers/AppProvider.tsx`.

**Auth (`web/middleware.ts`):** Supabase SSR session refresh + route protection. `/app/*` redirects to `/login` when no session; `/app/payer-portal` is exempt (token-based). **If Supabase env vars are unset the middleware is a no-op** and `/app/*` is open — this is the local file-fallback dev mode. Org-scoped multi-tenancy and invites: `api/auth/*`, migration `006`.

**API routes (`web/app/api/`):** `invoices/*` (upload/parse/parse-sample/seed/CRUD + `[id]/confirm`, `[id]/eligibility`), `eis/*` (submissions, process, seed, `worker`, `horizon-poll`), `bir/eis` (mock BIR endpoint), `swap/*` + `receivable/mint` + `payroll/*` (quote/build/route) + `tx/submit` (Soroban invocation + quotes + client-signed submit), `noa/[receivableId]/*` (Notice of Assignment issue/ack), `payers/*`, `reconciliation/scan`, `fx/rate` (Reflector), `soroban/status`, `wallets/balances`, `dashboard/summary`, `auth/*` (invite, members).

**Cron jobs (`web/vercel.json`):** `eis/worker` (every 6h — T+3 retry/expiry), `eis/horizon-poll` (every 10 min — chain event ingest), `reconciliation/scan` (daily — leakage scan). Protected by `CRON_SECRET`.

### Persistence — dual backend

`lib/eis/store.ts`, `lib/invoices/store.ts`, `lib/payers/store.ts`, and `lib/settlement/store.ts` each pick a backend at runtime: **Supabase** when `SUPABASE_URL` + a service-role/anon key are set, otherwise a **local JSON file fallback** under `web/data/`. Always write store access through these modules — never assume one backend. Supabase schema lives in `supabase/migrations/` (`001`–`006`: eis_submissions, factoring_invoices, closed_loop, reserve_ledger, eis_t3_fields, auth_multitenancy).

The hosted Supabase project ref is `ifzyntqwymmgimnxtguz` — `SUPABASE_URL` must point at it (`https://ifzyntqwymmgimnxtguz.supabase.co`). Per `.cursor/README.md`, do not register this project's Supabase MCP server globally.

### Compliance pipeline (the EIS oracle)

The BIR EIS oracle runs **in-process**, not in an external queue. Flow (`lib/eis/`):

1. An on-chain API route (mint/swap/payroll) calls `triggerEisFromChain()` (`trigger.ts`).
2. That calls `enqueueEisProcessing()` (`oracle.ts`) — a **fire-and-forget** `void processLedgerEvent().catch()`. It does not block the user response.
3. `processLedgerEvent()`: maps the ledger event to the BIR EIS payload (`schema.ts` / `payload-fields.ts`), JWS-signs it (`jws.ts` — mock signature unless `BIR_EIS_LIVE`), submits to the BIR endpoint (`bir-mock.ts` mock, or `bir-client.ts` when live), then writes a reference memo back to Stellar (`memo.ts`).
4. State transitions `queued → submitted → acknowledged → memo_written` (or `failed`), persisted via `store.ts`. Idempotency key = `orgId:stellarTxHash:referenceId`.
5. The `worker.ts` cron retries stale `queued`/`failed` submissions still inside their T+3 window and marks expired ones permanently failed; `horizon-poll.ts` ingests chain events the live API path may have missed.

### Soroban contracts (`soroban/contracts/`)

Four Rust crates (`soroban-sdk` 25), each with `src/lib.rs` + `src/test.rs`:

| Crate | Responsibility | Deployed |
|-------|----------------|----------|
| `receivable_token` | `initialize`, `mint`, `is_minted`, `get_receivable` — one mint per invoice (SAC-style receivable) | testnet |
| `axial_swap` | `initialize`, `quote`, `execute_advance` — USDC advance vs receivable at configurable `advance_bps` (85% default) | testnet |
| `payroll_split` | `initialize`, `quote`, `route_payroll`, `get_payroll` — USDC split to SSS/PhilHealth/Pag-IBIG + net to employees | testnet |
| `settlement` | Per-invoice lockbox: `settle` distributes collected USDC (advance → funder, remainder → MSME), records shortfalls as leakage | **not deployed** — code only |

Web talks to chain via `lib/soroban/`: `config.ts` resolves contract IDs and signing keys from env or `soroban/deployments/testnet.json`; `invoke-*.ts` builds and submits transactions; `isSwapChainEnabled` / `isReceivableChainEnabled` / `isPayrollChainEnabled` gate whether a route runs on-chain or returns a mocked result. Default signing is **custodial/server-side** (server holds funder/MSME/issuer secrets). `freighter.ts` + `build-tx.ts` + `tx/submit` provide an optional client-signed path (Freighter browser extension). Deployed contract IDs and signing-key publics are not committed — `testnet.json` is gitignored; copy `testnet.example.json`.

### Environment & deployment

`web/.env.example` is the source of truth for env vars. Required for a working demo: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, the public Supabase vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — needed by browser client + auth middleware), `NEXT_PUBLIC_BASE_URL`, and the three Stellar secrets (`STELLAR_FUNDER_SECRET`, `STELLAR_MSME_SECRET`, `STELLAR_ISSUER_SECRET`). `cd soroban && ./scripts/write-web-env.sh` populates the Stellar values after a deploy. `AXIAL_ALLOW_SEED=true` enables demo seed routes — preview only.

**CI deploy:** `.github/workflows/deploy-cloudrun.yml` builds `web/Dockerfile` and deploys to **Google Cloud Run** (`asia-southeast1`, service `axial-web`) on every push to `main`; build-time and runtime env come from GitHub Actions vars/secrets. `next.config.ts` uses `output: "standalone"` for the container build. `web/vercel.json` (region `sin1`, raised `maxDuration` on OCR/balance/worker routes, cron schedules) still exists for the alternate Vercel deploy path — `docs/vercel-deployment.md` documents it.

## Locked Architecture Decisions

Finalized 2026-05-14 — do not reopen without updating `docs/Axial.md` first.

| Decision | Locked value |
|---|---|
| Settlement asset | **USDC on Stellar** — Circle-issued |
| USDC Mainnet issuer | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| User-facing denomination | **PHP** — all invoices, payroll, dashboards show pesos |
| FX conversion | Reflector oracle (`lib/fx/reflector.ts`) with a hardcoded `56.5` PHP/USDC fallback when the oracle is unreachable |
| Wallet signing | **Custodial backend signing** — the Next.js server holds funder/MSME/issuer secrets and signs all Soroban transactions |
| PHP fiat rail | **PDAX** via PDAX Connect API (SEP-24); Axial never custodies fiat |
| PHPC | ❌ Retired — on Polygon/Ronin not Stellar; exited BSP sandbox July 2025 |
| BIR EIS mandate scope | Phase 1 taxpayers only (Large Taxpayers, e-commerce, exporters, ≥₱1B gross sales, CAS/CBA users) |

**Current deploy reality:** the hackathon build runs the contracts on **Stellar testnet** (`soroban/deployments/testnet.json`, testnet RPC, a testnet USDC SAC). The Mainnet issuer above is the production settlement reference, not where the demo runs.

## Build Scope (L1 → L3)

Build L1 completely before L2/L3:

- **L1 (must ship):** Soroban contracts deployed · real USDC atomic swap · payroll split · BIR EIS oracle · JWS-signed payload · mock BIR endpoint · Stellar memo write-back. No external deps.
- **L2 (nice to have):** L1 + mocked PDAX UI screens.
- **L3 (dropped 2026-05-22):** real PDAX Connect API calls — PDAX sandbox access was not granted; final scope is L1 + L2. See `docs/sprint.md` and the "Build audit" section in `docs/Axial.md`.

## Design System

Defined in `docs/dsd-axial.md`, wired into `web/tailwind.config.ts`.

- **Color:** Material Design 3 — obsidian/deep-slate primary, muted teal + soft silver accents. Dark-mode first (`class` strategy).
- **Typography:** Geist sans-serif. Utilities: `headline-xl/lg/md`, `body-lg/md`, `label-md/sm`.
- **Visual language:** Glassmorphism, generous white space, an "unrushed" experience. Passive/ambient status — never intrusive alerts.
- **Icons:** Material Symbols Outlined (loaded in root layout).
- **UX principle — "Silent success":** compliance and liquidity operations confirm passively, not via modal interruptions. Never write `URGENT`, never use all-caps in status messages.

## Key Domain Concepts

| Term | Meaning |
|---|---|
| SAC | Stellar Asset Contract — on-chain representation of a verified receivable |
| Atomic swap | USDC ↔ receivable token, executed by a denomination-agnostic Soroban contract |
| BIR EIS | Bureau of Internal Revenue Electronic Invoicing System — JSON + JWS, T+3 window; Phase 1 taxpayers only |
| T+3 window | Submission must reach BIR within 3 calendar days of the transaction date |
| JWS | JSON Web Signature — required signing format for BIR EIS payloads (mock signature in this build) |
| Statutory split | Automatic payroll deduction routing to SSS, PhilHealth, Pag-IBIG via Soroban contract |
| NoA | Notice of Assignment — payer acknowledgement that a receivable has been assigned to a funder |
| Lockbox | Per-invoice settlement address; the `settlement` contract distributes collected funds |
| SEP-24 | Stellar anchor interface for PHP on/off-ramp; PDAX is the production driver |
| Reflector | Stellar-native price oracle for the PHP/USDC FX rate |

## Document Conventions

- **`docs/Axial.md`** is the canonical foundation — origin story, locked decisions, open questions, submission record. **Update here first, then propagate to derivative docs.**
- Derivative docs in `docs/`: `brd-axial.md`, `prd-axial.md`, `sdd-axial.md`, `dsd-axial.md`, `gtm-axial.md`, `flow.md`. The SDD's backend architecture and `flow.md`'s status matrix predate / lag the current `web/app/api/` implementation — trust the code where they conflict.
- New product/technical docs go in `docs/` as `{type}-axial.md` (e.g. `rfc-axial-eis-oracle.md`).
- Intermediates and scratch files go in `.tmp/` (not committed).
