# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Axial Is

Axial is a liquidity and compliance engine for Philippine MSMEs. The buyer job is **working capital financing** (cash from confirmed Net 60–90 receivables); the product claim is **"Instant Capital, Effortless Compliance"** — not factoring-on-blockchain alone, but the rail where liquidity and compliance are the same event. Founders unlock cash from tokenized receivables via Stellar/Soroban atomic swaps while BIR EIS filings and SSS/PhilHealth/Pag-IBIG payroll splits are **prepared for human review and one-click approval** (Compliance Co-Pilot). Auto-submit is a roadmap item gated on Permit to Transmit. *"Invisible Compliance"* is the north-star vision only.

All regulatory and legal questions are **Philippines-jurisdiction-first**.

**Built for:** Build on Stellar Philippines Hackathon 2026 (May 18–24). Four-person team, seven days.

## Development Commands

Frontend — from `web/`:

```bash
npm install
npm run dev     # Dev server with Turbopack (http://localhost:3000)
npm run build   # Production build (next build --turbopack)
npm run lint    # ESLint
npm test        # Vitest unit/guardrail tests
npm run test:e2e # Playwright (dev server required)
npm start       # Production server
```

Roadmap for chaos resilience + stablecoin payroll (Testnet-first new crates): [`docs/plans/resilience-stablecoin-payroll/overview.md`](docs/plans/resilience-stablecoin-payroll/overview.md). **Do not edit Mainnet-deployed Soroban crates**; new contracts deploy on Testnet first.

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
├── soroban/   # Rust/Soroban workspace (Mainnet L1 + Testnet contractor_payroll)
├── web/       # Next.js 15 — UI + API routes
├── supabase/  # SQL migrations
├── docs/      # Axial.md (canonical), flow.md, plans/, rfc-*
└── scripts/   # Tooling (pitch-deck PDF)
```

### Frontend + Backend live together in `web/`

The "backend" is **Next.js Route Handlers under `web/app/api/`** — there is no separate server. The SDD's modular-monolith / BullMQ-Temporal plan was not adopted; ignore it as a build target.

`docs/flow.md` (built/mock/planned matrix) and the **"Implementation status" table in `docs/Axial.md`** are useful maps but **can lag the code** — when they conflict with what's in `web/`, trust the code. As of this writing the following are built and wired: the 4 Soroban contracts (all deployed + initialized on **Stellar Mainnet** — the network the system runs on; see the table below), USDC atomic swap, payroll split, BIR EIS Co-Pilot (`prepared` → Compliance **Approve** → mock/live BIR), the T+3 retry worker + Horizon poll + reconciliation cron jobs, Supabase auth with org-scoped multi-tenancy, the payer portal, Funder Protection Center + `/app/funder-portal`, NoA issue/ack, Reflector FX with a hardcoded fallback, and on-chain settlement (`register_invoice`, payer Freighter lockbox funding, `settle` on `mark_collected` with contract-balance pre-check — B-2 S5). **Still not built:** live BIR submission (mock by default — `BIR_EIS_LIVE` gates it; demo may auto-ack only when `AXIAL_ALLOW_SEED` or `EIS_DEMO_AUTO_ACK` and not live) and real PDAX Connect calls.

**Stack:** Next.js 15.5 · React 19 · TypeScript 5 (strict) · Tailwind CSS 4 · `@stellar/stellar-sdk` · `@supabase/supabase-js` + `@supabase/ssr` (auth) · `tesseract.js` + `pdf-parse` + `sharp` (invoice OCR) · `stellar-hd-wallet` (key derivation). Path alias `@/*` → `web/*`.

**Pages (`web/app/`):**
- Root `layout.tsx` — just `<html>`, Geist fonts, Material Symbols. No shell.
- `page.tsx` — public marketing landing at `/`.
- `(auth)/` route group — `login` and `invite` pages with their own minimal layout; `auth/callback/route.ts` handles the Supabase OAuth code exchange.
- `app/app/layout.tsx` — the authenticated **AppShell** layout (renders `AppShell`, resolves chain status + auth user server-side). Tabs under `/app/*`: `app/page.tsx` (Overview), `liquidity/`, `compliance/`, `settings/`, plus `payer-portal/` and `funder-portal/` (token-authenticated where applicable).

Each page is a thin wrapper that renders a view from `components/views/` (`OverviewView`, `LiquidityView`, `PayerPortalView`, etc.). Shared shell in `components/layout/`, primitives in `components/ui/`, client state via `components/providers/AppProvider.tsx`.

**Auth (`web/middleware.ts`):** Supabase SSR session refresh + route protection. `/app/*` redirects to `/login` when no session; `/app/payer-portal` and `/app/funder-portal` are exempt (token-based). **If Supabase env vars are unset the middleware is a no-op** and `/app/*` is open — this is the local file-fallback dev mode. Org-scoped multi-tenancy and invites: `api/auth/*`, migration `006`.

**API routes (`web/app/api/`):** `invoices/*` (upload/parse/parse-sample/seed/CRUD + `[id]/confirm`, `[id]/eligibility`), `eis/*` (submissions, process, seed, `[id]/approve`, `worker`, `horizon-poll`, `monitor`), `bir/eis` (mock BIR endpoint), `swap/*` + `receivable/mint` + `payroll/*` (quote/build/route) + `tx/submit` (Soroban invocation + quotes + client-signed submit), `lockbox/fund` (payer lockbox funding), `noa/[receivableId]/*` (Notice of Assignment issue/ack), `payers/*`, `funder/*`, `reconciliation/scan`, `fx/rate` (Reflector), `soroban/status`, `wallets/balances`, `dashboard/summary`, `auth/*` (invite, members).

**Background jobs (Cloud Scheduler):** HTTP endpoints on Cloud Run — `eis/worker` (every 6h — T+3 retry/expiry), `eis/horizon-poll` (every 10 min — chain event ingest), `reconciliation/scan` (daily — leakage scan), plus `eis/monitor` and settlement register-retry as documented. Each call is protected by `CRON_SECRET`. Cloud Run has no built-in cron — wire them as **GCP Cloud Scheduler** jobs (endpoints ready; jobs not yet set up). See [`docs/ops-cloud-scheduler.md`](docs/ops-cloud-scheduler.md).

### Persistence — dual backend

`lib/eis/store.ts`, `lib/invoices/store.ts`, `lib/payers/store.ts`, and `lib/settlement/store.ts` each pick a backend at runtime: **Supabase** when `SUPABASE_URL` + a service-role/anon key are set, otherwise a **local JSON file fallback** under `web/data/`. Always write store access through these modules — never assume one backend. Supabase schema lives in `supabase/migrations/` (`001`–`011`, including dual `007_*` files: eis_submissions, factoring_invoices, closed_loop, reserve_ledger, eis_t3_fields, auth_multitenancy, eis prepared status / on-chain invoice id, org features, invoice settlement guards, telegram links, org backfill).

The hosted Supabase project ref is `ifzyntqwymmgimnxtguz` — `SUPABASE_URL` must point at it (`https://ifzyntqwymmgimnxtguz.supabase.co`). Per `.cursor/README.md`, do not register this project's Supabase MCP server globally.

### Compliance pipeline (the EIS Co-Pilot)

The BIR EIS oracle runs **in-process**, not in an external queue. **Locked product model (2026-06-18):** prepare → human review → submit. Auto-submission is gated on EIS certification + Permit to Transmit (PTT). **Demo reality:** auto-ack past the UI gate only when `AXIAL_ALLOW_SEED` or `EIS_DEMO_AUTO_ACK` is set and `BIR_EIS_LIVE` is not true.

Flow (`lib/eis/`):

1. An on-chain API route (mint/swap/payroll) calls `triggerEisFromChain()` (`trigger.ts`).
2. That calls `enqueueEisProcessing()` (`oracle.ts`) — a **fire-and-forget** `void processLedgerEvent().catch()`. It does not block the user response.
3. `processLedgerEvent()`: maps the ledger event to the BIR EIS payload (`schema.ts` / `payload-fields.ts`), JWS-signs it (`jws.ts` — mock signature unless `BIR_EIS_LIVE`), and persists status **`prepared`** for human review. It does **not** auto-submit `prepared` rows to live BIR.
4. Compliance **Approve** (`POST /api/eis/[id]/approve`) calls `submitPreparedSubmission()` → BIR endpoint (`bir-mock.ts` mock, or `bir-client.ts` when live) → Stellar memo write-back (`memo.ts`).
5. State transitions include `prepared → submitted → acknowledged → memo_written` (or `failed` / expired), persisted via `store.ts`. Idempotency key = `orgId:stellarTxHash:referenceId`.
6. The `worker.ts` cron retries stale `queued`/`failed` submissions still inside their T+3 window, nudges aged `prepared` rows, and marks expired ones permanently failed; it never auto-submits `prepared`. `horizon-poll.ts` ingests chain events the live API path may have missed.

### Soroban contracts (`soroban/contracts/`)

Four Rust crates (`soroban-sdk` 25), each with `src/lib.rs` + `src/test.rs`:

| Crate | Responsibility | Deployed |
|-------|----------------|----------|
| `receivable_token` | `initialize`, `mint`, `is_minted`, `get_receivable` — one mint per invoice (SAC-style receivable) | Mainnet (+ Testnet sandbox) |
| `axial_swap` | `initialize`, `quote`, `execute_advance` — USDC advance vs receivable at configurable `advance_bps` (85% default) | Mainnet (+ Testnet sandbox) |
| `payroll_split` | `initialize`, `quote`, `route_payroll`, `get_payroll` — USDC split to SSS/PhilHealth/Pag-IBIG + net to employees | Mainnet (+ Testnet sandbox) |
| `settlement` | Per-invoice lockbox: `settle` distributes collected USDC (advance → funder, remainder → MSME), records shortfalls as leakage | Mainnet + Testnet — `register_invoice`, lockbox funding, and on-chain `settle` (B-2 S5) wired on `mark_collected` |

Web talks to chain via `lib/soroban/`: `config.ts` resolves contract IDs and signing keys from `MAINNET_`-prefixed env vars (falling back to `soroban/deployments/mainnet.json`); the network is fixed to Mainnet (`network.ts`). `invoke-*.ts` builds and submits transactions; `isSwapChainEnabled` / `isReceivableChainEnabled` / `isPayrollChainEnabled` gate whether a route runs on-chain or returns a mocked result. Default signing is **custodial/server-side** (server holds funder/MSME/issuer secrets). `freighter.ts` + `build-tx.ts` + `tx/submit` provide an optional client-signed path (Freighter browser extension). Deployed contract IDs and signing-key publics are not committed — `mainnet.json` / `testnet.json` are gitignored; copy the matching `.example.json`.

### Environment & deployment

`web/.env.example` is the source of truth for env vars. Required for a working demo: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, the public Supabase vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — needed by browser client + auth middleware), `NEXT_PUBLIC_BASE_URL`, and the three Mainnet Stellar secrets (`MAINNET_STELLAR_FUNDER_SECRET`, `MAINNET_STELLAR_MSME_SECRET`, `MAINNET_STELLAR_ISSUER_SECRET` — the app reads `MAINNET_`-prefixed chain env). `cd soroban && ./scripts/write-web-env.sh` populates the Stellar values after a deploy. `AXIAL_ALLOW_SEED=true` enables demo seed routes — preview only.

**CI deploy:** `.github/workflows/deploy-cloudrun.yml` builds `web/Dockerfile` and deploys to **Google Cloud Run** (`asia-southeast1`, service `axial-web`) on every push to `main`; build-time and runtime env come from GitHub Actions vars/secrets. `next.config.ts` uses `output: "standalone"` for the container build. Vercel is not used.

## Locked Architecture Decisions

Finalized 2026-05-14 — do not reopen without updating `docs/Axial.md` first.

| Decision | Locked value |
|---|---|
| Primary tagline | **Instant Capital, Effortless Compliance** (locked 2026-06-18) — *"Invisible Compliance"* is north-star only |
| Compliance model | **Compliance Co-Pilot** — prepare → review → submit; auto-submit gated on Permit to Transmit (PTT) |
| Operating network | **Stellar Mainnet only** (locked 2026-05-22) — testnet is retired as an operating target; it remains a developer sandbox only |
| Settlement asset | **USDC on Stellar** — Circle-issued |
| USDC Mainnet issuer | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| User-facing denomination | **PHP** — all invoices, payroll, dashboards show pesos |
| FX conversion | Reflector oracle (`lib/fx/reflector.ts`) with a hardcoded `56.5` PHP/USDC fallback when the oracle is unreachable |
| Wallet signing | **Custodial backend signing** (default) + optional Freighter client-sign / lockbox funding |
| PHP fiat rail | **PDAX** via PDAX Connect API (SEP-24); Axial never custodies fiat |
| PHPC | ❌ Retired — on Polygon/Ronin not Stellar; exited BSP sandbox July 2025 |
| BIR EIS mandate scope | Phase 1 taxpayers only (Large Taxpayers, e-commerce, exporters, ≥₱1B gross sales, CAS/CBA users) |

**Current deploy reality:** Axial runs on **Stellar Mainnet** — 4 L1 contracts deployed (`soroban/deployments/mainnet.json`), Circle USDC. Testnet is sandbox only; Track A `contractor_payroll` is Testnet-deployed (see plan overview).

## Build Scope (L1 → L3)

Build L1 completely before L2/L3:

- **L1 (must ship):** Soroban contracts deployed · real USDC atomic swap · payroll split · BIR EIS oracle · JWS-signed payload · mock BIR endpoint · Stellar memo write-back. Named external dependency: Circle USDC issuer.
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
| Compliance Co-Pilot | Locked model: prepare → human review → submit; auto-submit gated on PTT |
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
