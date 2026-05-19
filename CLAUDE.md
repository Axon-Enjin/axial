# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Axial Is

Axial is a liquidity and compliance engine for Philippine MSMEs. It solves two structural problems simultaneously: a $221B cash-flow gap caused by Net 60–90 B2B payment terms, and manual, error-prone BIR/statutory compliance. The value proposition is **"Instant Capital, Invisible Compliance"** — founders unlock cash from tokenized receivables via Stellar/Soroban atomic swaps while BIR EIS submissions and SSS/PhilHealth/Pag-IBIG payroll splits happen automatically in the background.

All regulatory and legal questions are **Philippines-jurisdiction-first**.

**Built for:** Build on Stellar Philippines Hackathon 2026 (May 18–24). Three devs, seven days.

## Development Commands

Frontend — from `prototype/`:

```bash
npm run dev     # Start dev server with Turbopack (http://localhost:3000)
npm run build   # Production build
npm run lint    # Run ESLint
npm start       # Start production server
```

Soroban — from WSL, directory `soroban/` (see `soroban/README.md`, `soroban/CONTRIBUTING.md`, `soroban/CONTRACTS.md`):

```bash
cd /mnt/c/Users/User/CODERIST/axonjn/axial/soroban
make setup           # first-time: .env, testnet, fund identity
make build
make deploy-testnet  # uses STELLAR_SOURCE from soroban/.env
```

## Architecture

### Repository Layout

```
axial/
├── soroban/            # Soroban workspace (build/deploy from WSL)
├── prototype/          # Next.js 15 App Router application
├── docs/               # Product docs: Axial.md (canonical), brd, prd, sdd, dsd, gtm
├── initial-docs/       # Founding strategy docs (archived — superseded by docs/)
└── FMD/                # Document templates (BRD, PRD, SDD, RFC, GTM) — no code
```

### Frontend (Current State: UI Prototype Only)

**Stack:** Next.js 15.5 · React 19 · TypeScript 5 (strict) · Tailwind CSS 4 · Material Symbols Outlined

**App Router structure (`prototype/app/`):**
- `layout.tsx` — Root layout with Geist fonts and Material Symbols
- `(app)/layout.tsx` — Auth layout containing `AppSidebar`
- `(app)/page.tsx` — Overview / Command Center
- `(app)/liquidity/page.tsx` — Tokenized AR and funding workflow
- `(app)/compliance/page.tsx` — Payroll split and BIR EIS status
- `(app)/settings/page.tsx` — Account and preferences

**Component pattern:** Pages import from `components/stitch/` — one view component per tab (`OverviewView`, `LiquidityView`, `ComplianceView`, `SettingsView`). These are currently scaffolded shells.

**Path alias:** `@/*` maps to `prototype/src/*` (tsconfig).

### Backend (Planned — not yet implemented)

Per `docs/sdd-axial.md`, the target architecture is a modular monolith → microservices:

| Layer | Technology |
|---|---|
| API Gateway / BFF | REST + OpenAPI (preferred for BIR API parity) or tRPC — decide Day 1 |
| Database | PostgreSQL (source of truth for UX projections) |
| Cache / locks | Redis |
| Job queue | BullMQ or Temporal — decide Day 1; drives T+3 BIR EIS scheduling |
| Blockchain | Stellar/Soroban — SAC tokenization, atomic swaps, settlement memos |
| Secrets | Vault / HSM / KMS — never in client code or env files |

**Compliance pipeline:** Ledger event → off-chain oracle maps to BIR EIS 20-field schema → JWS sign → T+3 submission worker → PostgreSQL state → success reference memo write-back to Stellar.

**Statutory engine:** Each payroll event splits SSS, PhilHealth, and Pag-IBIG deductions via a denomination-agnostic Soroban contract (asset address is a parameter).

## Locked Architecture Decisions

These were finalized 2026-05-14 and must not be reopened without updating `docs/Axial.md` first.

| Decision | Locked value |
|---|---|
| Settlement asset | **USDC on Stellar** — Circle-issued, Mainnet, no external dependencies |
| USDC issuer address | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| User-facing denomination | **PHP** — all invoices, payroll, and compliance dashboards show pesos |
| FX conversion | At the edges via Reflector oracle (preferred) or hardcoded rate (acceptable for hackathon) |
| PHP fiat rail | **PDAX** via PDAX Connect API (SEP-24 interface); Axial never custodies fiat |
| PHPC | ❌ Retired — PHPC is on Polygon/Ronin, not Stellar; exited BSP sandbox July 2025 |
| BIR EIS mandate scope | Phase 1 taxpayers only (Large Taxpayers, e-commerce, exporters, ≥₱1B gross sales, CAS/CBA users) — not all MSMEs |

## Hackathon Build Plan

**Scope hierarchy — build L1 completely before touching L2 or L3:**

| Layer | What ships | External dependency |
|---|---|---|
| **L1 — must ship** | Soroban contracts on Mainnet · real USDC atomic swap · payroll split · BIR EIS oracle · JWS-signed payload · mock BIR endpoint · Stellar memo write-back | None |
| **L2 — nice to have** | Everything in L1 + mocked PDAX UI screens | None |
| **L3 — bonus** | Real PDAX Connect API calls | PDAX sandbox access |

**Work streams:**

| Stream | Owner | Surface area |
|---|---|---|
| Smart contracts (Soroban + Rust) | Aidan or Rhandie | Contracts, deploy scripts, Mainnet ops, USDC trustlines |
| Backend (API routes + oracle + workers) | Gerald | API routes, PostgreSQL, Redis, EIS oracle, mock BIR endpoint |
| Frontend (UI + design system) | Remaining dev | Four tabs, glassmorphic dark surfaces, microcopy |

**Day 1 decisions to lock immediately** (unresolved decisions block implementation):
- Q1: BullMQ vs Temporal for the EIS submission worker
- Q2: REST + OpenAPI vs tRPC for the API layer
- Q3: Single Soroban contract or several smaller ones
- Q7: Wallet management for demo (Freighter, Albedo, or custodial backend signing)

Full decision list and rationale in `docs/Axial.md` §11 and "Open questions for the dev team".

## Design System

Defined in `docs/dsd-axial.md` and wired into `prototype/tailwind.config.ts`.

- **Color system:** Material Design 3 — custom obsidian/deep-slate primary, muted teal and soft silver accents. Dark-mode first (`class` strategy).
- **Typography:** Geist sans-serif. Tailwind utilities: `headline-xl/lg/md`, `body-lg/md`, `label-md/sm`.
- **Visual language:** Glassmorphism, generous white space, "unrushed" experience. Passive/ambient status indicators — never intrusive alerts.
- **Icons:** Material Symbols Outlined via Google Fonts (loaded in root layout).
- **UX principle:** "Silent success" — compliance and liquidity operations confirm completion passively, not via modal interruptions. Never write `URGENT`, never use all-caps in status messages.

## Key Domain Concepts

| Term | Meaning |
|---|---|
| SAC | Stellar Asset Contract — on-chain representation of a verified receivable |
| Atomic swap | USDC on Stellar ↔ receivable token, executed by a denomination-agnostic Soroban contract |
| BIR EIS | Bureau of Internal Revenue Electronic Invoicing System — JSON + JWS, T+3 window; currently Phase 1 taxpayers only |
| T+3 window | Submission must reach BIR within 3 calendar days of the transaction date |
| JWS | JSON Web Signature — required signing format for BIR EIS payloads; key lives in vault, never in env files |
| Statutory split | Automatic payroll deduction routing to SSS, PhilHealth, Pag-IBIG via Soroban contract |
| SEP-24 | Stellar anchor interface for PHP on/off-ramp; PDAX is the production driver, Coins.ph can plug in without changing contract logic |
| Reflector | Stellar-native price oracle used for PHP/USDC FX rate at swap time |

## Document Conventions

- **`docs/Axial.md`** is the canonical foundation — origin story, locked decisions, open questions, hackathon submission record. **Update here first, then propagate to derivative docs.**
- Derivative docs in `docs/`: `brd-axial.md`, `prd-axial.md`, `sdd-axial.md`, `dsd-axial.md`, `gtm-axial.md`.
- New product/technical docs belong in `docs/` using the pattern `{type}-axial.md` (e.g., `rfc-axial-eis-oracle.md`).
- Templates for BRD, PRD, DSD, SDD, RFC, QAD, GTM are in `FMD/` — use them as starting points.
- Intermediates and scratch files go in `.tmp/` (not committed).
