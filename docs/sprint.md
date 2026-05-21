# Axial — Sprint Board

**Created:** 2026-05-22 · **Owner:** Carlos (Team Lead) · **Status:** active

This is the working task board for Axial, derived from the **CTO/auditor review on
2026-05-22**. It is the single place agents and humans track *what to do next* and
*which files each task touches*.

- Scope decisions behind this board: see **"Build audit & final scope lock (2026-05-22)"**
  in [`Axial.md`](Axial.md).
- Built-vs-planned feature matrix: [`flow.md`](flow.md).
- When a task lands, update its **Status** here and the matrices in `Axial.md`
  ("Implementation status") and `flow.md`.

---

## How to use this file

- Tasks are grouped by horizon: **Sprint 0** (hackathon close, May 23–24) and
  **Backlog** (post-hackathon).
- Each task lists **Priority · Owner · Status** and a **References** block linking
  the docs and code paths needed to do it. Start from the References.
- Status values: `🔴 todo` · `🟡 in progress` · `✅ done` · `⬜ backlog` · `❌ dropped`.
- Priority: `P0` blocker · `P1` important · `P2` nice-to-have.

---

## Reference index

**Product & architecture docs** (`docs/`)

| Doc | What it is |
|---|---|
| [`Axial.md`](Axial.md) | Canonical foundation — origin, locked decisions, audit log, submission record. **Update here first.** |
| [`flow.md`](flow.md) | Visual built/mock/planned matrix + sequence diagrams |
| [`brd-axial.md`](brd-axial.md) | Business justification, success metrics, stakeholders |
| [`prd-axial.md`](prd-axial.md) | Feature specs, user stories, acceptance criteria |
| [`sdd-axial.md`](sdd-axial.md) | System design — **note: backend section predates the current `web/app/api/` build; trust the code** |
| [`dsd-axial.md`](dsd-axial.md) | Design system — tokens, components, microcopy rules |
| [`gtm-axial.md`](gtm-axial.md) | Go-to-market strategy and phasing |
| [`clr-axial.md`](clr-axial.md) | Compliance & legal readiness — NoA mechanism, KYC/KYB, Data Privacy Act |
| [`rfc-axial-closed-loop-settlement.md`](rfc-axial-closed-loop-settlement.md) | Closed-loop / confirmed-invoice settlement deep dive |
| [`rfc-axial-eis-oracle.md`](rfc-axial-eis-oracle.md) | BIR EIS oracle deep dive |
| [`vercel-deployment.md`](vercel-deployment.md) | Vercel deploy + env var guide |

**Engineering docs**

| Doc | What it is |
|---|---|
| [`../CLAUDE.md`](../CLAUDE.md) | Repo guide for agents — commands, architecture, conventions |
| [`../soroban/README.md`](../soroban/README.md) | Soroban build/deploy guide (WSL) |
| [`../soroban/CONTRACTS.md`](../soroban/CONTRACTS.md) | Contract → crate map, on-chain vs off-chain split |
| [`../soroban/CONTRIBUTING.md`](../soroban/CONTRIBUTING.md) | Per-dev Stellar identity setup |
| [`../soroban/TESTNET.md`](../soroban/TESTNET.md) | One-command testnet demo setup |
| [`../web/README.md`](../web/README.md) | Web app commands + chain config |
| [`../web/.env.example`](../web/.env.example) | Source of truth for env vars |

**Key code surfaces**

| Area | Path |
|---|---|
| API routes (the "backend") | `../web/app/api/` |
| EIS oracle pipeline | `../web/lib/eis/` |
| Soroban invocation (custodial signing) | `../web/lib/soroban/` |
| Persistence (Supabase + file fallback) | `../web/lib/eis/store.ts`, `../web/lib/invoices/store.ts`, `../supabase/migrations/` |
| Page views | `../web/components/views/` |
| Soroban contracts | `../soroban/contracts/` |
| Deployed contract IDs (gitignored) | `../soroban/deployments/testnet.json` |

---

## Locked decisions (from the 2026-05-22 audit)

| # | Decision | Detail |
|---|---|---|
| D1 | **L3 dropped** | PDAX sandbox access not granted. Final scope = **L1 + L2** (L2 = our mocked PDAX UI). |
| D2 | **Custodial signing (Q7)** | Server holds funder/MSME/issuer secrets and signs all Soroban txns. No Freighter in v1. |
| D3 | **Mainnet is conditional** | Deploy to Mainnet on Day 6 only if testnet is stable; testnet stays the live demo path. |
| D4 | **Closed loop is not live** | Payer-confirm is a demo PATCH. Do not present the closed-loop settlement as working. |

---

## Sprint 0 — Hackathon close (May 23–24)

> Goal: protect a working L1 demo, remove demo-credibility risks, ship a landing page.
> Do **not** start large builds (Freighter, payer portal, settlement contract) now.

### S0-1 · Fix fake audit-log dates in Settings · `P0` · 🔴 todo
The Settings audit log is hardcoded with dates `2026-10-24` (5 months in the future).
A judge clicking Settings sees fabricated future-dated logs. Fix the dates to a
realistic range, or hide the panel for the demo.
- **References:** [`../web/components/views/SettingsView.tsx`](../web/components/views/SettingsView.tsx) (`auditLogs` array)

### S0-2 · Add a visible "Testnet" badge · `P1` · 🔴 todo
Resolve Axial.md Q10 — make the demo environment explicit so judges know it is testnet.
Small badge in the top bar / sidebar.
- **References:** [`../web/components/layout/TopBar.tsx`](../web/components/layout/TopBar.tsx), `../web/components/layout/AppShell.tsx`, `getPublicChainStatus()` in `../web/lib/soroban/config.ts`

### S0-3 · Build the public landing page · `P1` · 🔴 todo
No marketing/landing route exists — `/` opens straight into the Overview tab. Add an
informative landing page in a separate route group (e.g. `app/(marketing)/page.tsx`)
so the app shell stays isolated. Content: tagline "Instant Capital, Invisible
Compliance", the problem ($221B gap + BIR EIS Dec-2026 mandate), the 5-step flow, a
"Testnet demo" badge, CTA into the app. Honor the brand voice (calm, never alarmist).
- **References:** `../web/app/layout.tsx`, `../web/app/(app)/layout.tsx`, [`dsd-axial.md`](dsd-axial.md) (§9 microcopy), `Axial.md` §6 (brand) + §7 (workflow), `../web/tailwind.config.ts`

### S0-4 · Measure real XLM cost of the contracts · `P1` · 🔴 todo
We have no measured deploy cost. Testnet and Mainnet share the same fee schedule —
open the 3 deploy transactions on stellar.expert (testnet) and record the XLM resource
fee, plus note WASM byte sizes. Budget Mainnet wallet accordingly (deploy + TTL rent + margin).
- Contract IDs (from `deployments/testnet.json`): `axial_swap` `CDDAIDM4D62OZL5MQPKO5ZFWE7TBRFJD5Y3L2UZKP5OVGP2VHZ2UU736` · `receivable_token` `CAQEEFBO44FONQKGCEHR2QFTLOIIO232Z7WM6722ZDA6MNAL2NNU7SOP` · `payroll_split` `CBJCEJMDGRGLVU7VHAFR2VSVSBIKIWZA6LBQN6SCLZVJU6YROTETY3MB`
- **References:** [`../soroban/README.md`](../soroban/README.md) (deploy/cost), `../soroban/deployments/testnet.json`, WASM at `soroban/target/wasm32v1-none/release/*.wasm`

### S0-5 · (Conditional) Deploy 3 contracts to Mainnet · `P2` · 🔴 todo
Per D3 — attempt only if testnet is stable, do it Day 6 not Day 7. Deploy
`receivable_token`, `axial_swap`, `payroll_split` to Mainnet, establish a Circle USDC
trustline, run one tiny test swap. Keep testnet as the live demo path; show Mainnet
contract IDs on stellar.expert as proof. Mainnet XLM wallet: `GB6TMTI6DB6BETQEPMKXOAYAMYKGNHR4AJVZHKEQ5LCVFINGEDQDKCFI` (Axial.md §13.9).
- **References:** [`../soroban/README.md`](../soroban/README.md) ("Deploy (mainnet)"), `../soroban/scripts/write-web-env.sh`, `Axial.md` §13.8–13.9, depends on **S0-4**

### S0-6 · Demo recording + ≥3 dry runs · `P0` · 🔴 todo
Record a clean end-to-end demo (Overview → Liquidity upload/seed → confirm → tokenize
& swap → Compliance payroll + EIS → Settings). Have the recording ready as a fallback
before the live demo. Follow the demo order in `Axial.md` "Implementation status".
- **References:** [`flow.md`](flow.md) §3 (demo path sequence), `Axial.md` "Implementation status"

### S0-7 · Sync docs before repo push · `P1` · 🟡 in progress
Keep `Axial.md`, `flow.md`, `CLAUDE.md`, and this file consistent as Sprint 0 lands.
(The 2026-05-22 audit edits are done — this task is the ongoing keep-in-sync.)
- **References:** [`Axial.md`](Axial.md), [`flow.md`](flow.md), [`../CLAUDE.md`](../CLAUDE.md)

---

## Backlog — Post-hackathon

> Theme: make the **closed-loop settlement model real** and remove custodial risk.
> This is what turns the L1 demo into a production-credible product.

### B-1 · Payer portal — KYB onboard + invoice confirm + NoA e-acknowledgement · `P0` · ⬜ backlog
Step 0 of the core workflow. Today the MSME clicks "confirm payer" on its own behalf —
that *is* the payment-redirection fraud the settlement-integrity review exists to
close. Build a real payer-facing surface: payer KYB onboarding, invoice confirmation,
and NoA e-acknowledgement, signed from the payer's own session.
- **References:** [`rfc-axial-closed-loop-settlement.md`](rfc-axial-closed-loop-settlement.md), [`clr-axial.md`](clr-axial.md) (NoA legal text), `Axial.md` §7.1 Step 0, `../web/lib/msme/invoice-trust.ts`, `../web/app/api/invoices/[id]/route.ts`

### B-2 · On-chain lockbox / settlement contract + reconciliation worker · `P0` · ⬜ backlog
Replace the `mark_collected` demo PATCH with a real collection path: a designated
lockbox address per invoice, a `settlement` Soroban contract (repay funder, release
reserve, return margin), and a reconciliation worker that auto-freezes the MSME and
escalates on leakage by T+X.
- **References:** [`soroban/CONTRACTS.md`](../soroban/CONTRACTS.md) (`settlement` crate, P2), [`rfc-axial-closed-loop-settlement.md`](rfc-axial-closed-loop-settlement.md), `../soroban/contracts/`, `../web/app/api/invoices/[id]/route.ts`

### B-3 · Freighter wallet integration (self-custody) · `P1` · ⬜ backlog
Removes the custodial-signing liability (D2). MSME signs its own mint/swap; payer signs
from the payer portal. Build-unsigned-tx-on-server → sign-in-browser → submit, with
testnet/mainnet network switching and a real "connected wallets" Settings surface.
- **References:** `../web/lib/soroban/invoke-receivable.ts`, `invoke-swap.ts`, `invoke-payroll.ts`, `config.ts`, `../web/components/views/SettingsView.tsx`, `Axial.md` Q7

### B-4 · T+3 submission worker + Horizon event subscription · `P1` · ⬜ backlog
The oracle currently submits immediately and is triggered by API hooks. Add a real T+3
scheduled submission worker and a Horizon/RPC ledger-event subscription so compliance
is event-driven, not request-driven.
- **References:** `../web/lib/eis/oracle.ts`, `../web/lib/eis/trigger.ts`, [`rfc-axial-eis-oracle.md`](rfc-axial-eis-oracle.md), [`sdd-axial.md`](sdd-axial.md) §5

### B-5 · Reflector FX oracle — replace hardcoded rate · `P2` · ⬜ backlog
The PHP/USDC rate is hardcoded (`DEMO_RATE = 56.5`). Wire the Reflector price oracle
and write the rate used to the contract event log so it is auditable (Axial.md §13.8).
- **References:** `../web/components/settings/PdaxRampCard.tsx`, `Axial.md` Q4 + §13.8

### B-6 · Auth + multi-tenancy · `P1` · ⬜ backlog
The app is single-org with no real auth — `(app)/layout.tsx` is a visual shell only.
Add login, org invites (OIDC preferred per Axial.md §11), and tenant scoping.
- **References:** `../web/app/(app)/layout.tsx`, `../web/components/providers/AppProvider.tsx`, `Axial.md` §11 (Auth mechanism)

### B-7 · Real BIR EIS integration (PTT certification path) · `P2` · ⬜ backlog
Replace the mock BIR endpoint and mock JWS with the real BIR EIS API and a
vault-mediated signing key once a Permit to Transmit is obtained.
- **References:** `../web/lib/eis/bir-mock.ts`, `../web/lib/eis/jws.ts`, `../web/app/api/bir/eis/route.ts`, [`clr-axial.md`](clr-axial.md), `Axial.md` §9.1

### B-8 · Reconcile the stale SDD backend architecture · `P2` · ⬜ backlog
`sdd-axial.md` still describes a modular monolith + Postgres + Redis + BullMQ/Temporal.
The actual build is Next.js API routes + Supabase + in-process oracle. Update the SDD
or add a clear "superseded" note so it stops misleading.
- **References:** [`sdd-axial.md`](sdd-axial.md), [`../CLAUDE.md`](../CLAUDE.md), [`flow.md`](flow.md) §5

### B-9 · PDAX Connect API (formerly L3) · `P2` · ❌ dropped (revisit if access granted)
Dropped from hackathon scope — sandbox access not granted (D1). The SEP-24 abstraction
means PDAX can wire in later behind the existing mocked UI with no contract changes.
Revisit only if PDAX grants access post-hackathon.
- **References:** `../web/components/settings/PdaxRampCard.tsx`, `Axial.md` §13.8 (SEP-24 abstraction)

---

*Keep this board current. When a task lands, update its Status here and propagate to
the matrices in [`Axial.md`](Axial.md) and [`flow.md`](flow.md).*
