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
make build           # all 3 crates → target/wasm32v1-none/release/*.wasm
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
├── soroban/      # Rust/Soroban workspace — 3 contract crates (build/deploy from WSL)
├── web/          # Next.js 15 App Router — UI + API routes + backend logic
├── supabase/     # SQL migrations for the hosted Supabase project
├── docs/         # Product docs: Axial.md (canonical), pitch-deck.html, brd/prd/sdd/dsd/gtm, rfc-*
├── scripts/      # Tooling and scripts (e.g., pdf-generation for the pitch deck)
├── FMD/          # Document templates (BRD, PRD, SDD, RFC, GTM) — no code
├── prototype/    # Early UI scratch (not the live app — ignore)
└── claude-design/ # Design scratch (not wired into the app)
```

### Frontend + Backend live together in `web/`

The "backend" is **Next.js Route Handlers under `web/app/api/`** — there is no separate server. The SDD's modular-monolith / BullMQ-Temporal plan was not adopted; ignore it as a build target.

For what is actually built vs. only documented, the source of truth is **`docs/flow.md`** (built/mock/planned matrix) and the **"Implementation status" table in `docs/Axial.md`**. Not built as of May 2026: real payer portal, on-chain lockbox/settlement contract, T+3 submission worker, reconciliation/leakage worker, Freighter wallet connect (all chain signing is custodial/server-side), Reflector FX (rate is hardcoded), mainnet deploy, and auth/multi-tenancy.

**Stack:** Next.js 15.5 · React 19 · TypeScript 5 (strict) · Tailwind CSS 4 · `@stellar/stellar-sdk` · `@supabase/supabase-js` · `tesseract.js` + `pdf-parse` (invoice OCR). Path alias `@/*` → `web/*`.

**Pages (`web/app/`):** root `layout.tsx` (Geist fonts + Material Symbols) → `page.tsx` (public landing at `/`) → `app/layout.tsx` (auth shell with `AppSidebar`, calls `getPublicChainStatus()` server-side) → four tabs at `/app/*`: `app/page.tsx` (Overview), `app/liquidity/`, `app/compliance/`, `app/settings/`. Each page is a thin wrapper that renders a view from `components/views/` (`OverviewView`, `LiquidityView`, etc.). `components/stitch/` holds older design-export versions of those views — `components/views/` is the live set. Shared shell in `components/layout/`, primitives in `components/ui/`, client state via `components/providers/AppProvider.tsx`.

**API routes (`web/app/api/`):** invoices (upload/parse/parse-sample/seed/CRUD), `eis/*` (submissions, process, seed), `bir/eis` (mock BIR endpoint), `swap/*` + `receivable/mint` + `payroll/*` (Soroban invocation + quotes), `soroban/status`, `wallets/balances`, `dashboard/summary`.

### Persistence — dual backend

`lib/eis/store.ts` and `lib/invoices/store.ts` pick a backend at runtime: **Supabase** when `SUPABASE_URL` + a service-role/anon key are set, otherwise a **local JSON file fallback** under `web/data/`. Always write store access through these modules — never assume one backend. Supabase schema lives in `supabase/migrations/` (`001_eis_submissions.sql`, `002_factoring_invoices.sql`).

The hosted Supabase project ref is `ifzyntqwymmgimnxtguz` — `SUPABASE_URL` must point at it (`https://ifzyntqwymmgimnxtguz.supabase.co`). Per `.cursor/README.md`, do not register this project's Supabase MCP server globally.

### Compliance pipeline (the EIS oracle)

The BIR EIS oracle runs **in-process**, not in an external queue. Flow (`lib/eis/`):

1. An on-chain API route (mint/swap/payroll) calls `triggerEisFromChain()` (`trigger.ts`).
2. That calls `enqueueEisProcessing()` (`oracle.ts`) — a **fire-and-forget** `void processLedgerEvent().catch()`. It does not block the user response.
3. `processLedgerEvent()`: maps the ledger event to the BIR EIS payload (`schema.ts` / `payload-fields.ts`), JWS-signs it (`jws.ts` — mock signature), submits to the mock BIR endpoint (`bir-mock.ts`), then writes a reference memo back to Stellar (`memo.ts`).
4. State transitions `queued → submitted → acknowledged → memo_written` (or `failed`), persisted via `store.ts`. Idempotency key = `orgId:stellarTxHash:referenceId`.

### Soroban contracts (`soroban/contracts/`)

Three Rust crates, each with `src/lib.rs` + `src/test.rs`:

| Crate | Responsibility |
|-------|----------------|
| `receivable_token` | `initialize`, `mint`, `is_minted`, `get_receivable` — one mint per invoice (SAC-style receivable) |
| `axial_swap` | `initialize`, `quote`, `execute_advance` — USDC advance vs receivable at configurable `advance_bps` (85% default) |
| `payroll_split` | `initialize`, `quote`, `route_payroll`, `get_payroll` — USDC split to SSS/PhilHealth/Pag-IBIG + net to employees |

Web talks to chain via `lib/soroban/`: `config.ts` resolves contract IDs and signing keys from env or `soroban/deployments/testnet.json`; `invoke-*.ts` builds and submits transactions; `isSwapChainEnabled` / `isReceivableChainEnabled` / `isPayrollChainEnabled` gate whether a route runs on-chain or returns a mocked result. Deployed contract IDs and signing-key publics are not committed — `testnet.json` is gitignored; copy `testnet.example.json`.

### Environment & deployment

`web/.env.example` is the source of truth for env vars. Required for a working demo: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the three Stellar secrets (`STELLAR_FUNDER_SECRET`, `STELLAR_MSME_SECRET`, `STELLAR_ISSUER_SECRET`). `cd soroban && ./scripts/write-web-env.sh` populates the Stellar values after a deploy. `AXIAL_ALLOW_SEED=true` enables demo seed routes — preview only.

Deployed on Vercel: **Root Directory `web`**, region `sin1`, OCR/balance/summary routes have raised `maxDuration` in `web/vercel.json`. Full guide: `docs/vercel-deployment.md`.

## Locked Architecture Decisions

Finalized 2026-05-14 — do not reopen without updating `docs/Axial.md` first.

| Decision | Locked value |
|---|---|
| Settlement asset | **USDC on Stellar** — Circle-issued |
| USDC Mainnet issuer | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| User-facing denomination | **PHP** — all invoices, payroll, dashboards show pesos |
| FX conversion | At the edges via Reflector oracle, or hardcoded rate (acceptable for hackathon) |
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
| SEP-24 | Stellar anchor interface for PHP on/off-ramp; PDAX is the production driver |
| Reflector | Stellar-native price oracle for PHP/USDC FX rate at swap time |

## Document Conventions

- **`docs/Axial.md`** is the canonical foundation — origin story, locked decisions, open questions, submission record. **Update here first, then propagate to derivative docs.**
- Derivative docs in `docs/`: `brd-axial.md`, `prd-axial.md`, `sdd-axial.md`, `dsd-axial.md`, `gtm-axial.md`. Note the SDD's backend architecture predates the current `web/app/api/` implementation — trust the code over the SDD where they conflict.
- New product/technical docs go in `docs/` as `{type}-axial.md` (e.g. `rfc-axial-eis-oracle.md`).
- Templates for BRD/PRD/DSD/SDD/RFC/QAD/GTM are in `FMD/`.
- Intermediates and scratch files go in `.tmp/` (not committed).
