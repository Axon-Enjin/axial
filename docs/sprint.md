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

- Tasks are grouped by horizon: **Sprint 0** (hackathon close, May 23–24) and the
  **Production Roadmap** — the committed post-hackathon build to a fully
  production-ready system.
- Each task lists **Priority · Owner · Status** and a **References** block linking
  the docs and code paths needed to do it. Start from the References.
- Status values: `🔴 todo` · `🟡 in progress` · `✅ done` · `📋 committed` (roadmap — scoped, not started) · `❌ dropped`.
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

### S0-1 · Fix fake audit-log dates in Settings · `P0` · ✅ done
Wired the audit log to live data from `GET /api/eis/submissions` (replaces the
hardcoded `2026-10-24` array). Loading + empty states included. The panel now
shows real EIS events once swaps or payroll runs execute. File fallback works
locally without Supabase; for the deployed demo set `SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY` on Vercel and confirm migration 001 is applied.
- **References:** [`../web/components/views/SettingsView.tsx`](../web/components/views/SettingsView.tsx)

### S0-2 · Add a visible "Testnet" badge · `P1` · ✅ done
Sidebar header now shows a small pill badge (teal on testnet, lavender on mainnet)
wired to `getPublicChainStatus().network` from the server layout. Also present in
the landing page nav. No client bundle impact — resolved server-side in
`web/app/app/layout.tsx`.
- **References:** [`../web/components/AppSidebar.tsx`](../web/components/AppSidebar.tsx), [`../web/app/app/layout.tsx`](../web/app/app/layout.tsx)

### S0-3 · Build the public landing page · `P1` · ✅ done
Routing restructured: the `(app)` route group became the `app` URL segment — all
four tabs now live at `/app/*`. Landing page at `web/app/page.tsx` serves `/`.
Content: tagline, $221B + BIR EIS problem cards, 5-step how-it-works flow, testnet
badge, CTAs. Brand voice per dsd-axial.md §9. AppSidebar nav hrefs and PAGE_META
keys updated to `/app/*`; three internal `<Link>` refs in OverviewView and
LiquidityView also updated.
- **References:** [`../web/app/page.tsx`](../web/app/page.tsx), [`../web/app/app/`](../web/app/app/), [`../web/components/AppSidebar.tsx`](../web/components/AppSidebar.tsx), [`../web/lib/demo-actions.ts`](../web/lib/demo-actions.ts)

### S0-4 · Measure real XLM cost of the contracts · `P1` · ✅ done
Pulled from Horizon testnet (same fee schedule as mainnet). All three contracts were
deployed 2026-05-20 by `GD67NPG7…`.

| Contract | WASM size | WASM upload fee | CreateContract fee |
|---|---|---|---|
| `axial_swap` | 8.9 KB | **0.726 XLM** (measured) | ~0.002 XLM |
| `receivable_token` | 4.2 KB | ~0.34 XLM (est. proportional) | ~0.002 XLM |
| `payroll_split` | 10.8 KB | ~0.89 XLM (est. proportional) | ~0.002 XLM |
| **Total 3 deploys** | | **~1.96 XLM** | **~0.006 XLM** |

**Recommended mainnet wallet balance: ≥10 XLM** (covers 3 WASM uploads + 3
CreateContracts + minimum base reserves 1 XLM + 0.5 XLM/entry × 3 entries + TTL
rent buffer + one test swap margin).

- Mainnet wallet: `GB6TMTI6DB6BETQEPMKXOAYAMYKGNHR4AJVZHKEQ5LCVFINGEDQDKCFI` (see S0-5)
- **References:** Horizon testnet · stellar.expert testnet · contract IDs in `deployments/testnet.json`

### S0-5 · (Conditional) Deploy 3 contracts to Mainnet · `P2` · 🔴 todo
Per D3 — attempt **Day 6 only** if testnet demo is stable. Keep testnet as the live
demo path; Mainnet contract IDs on stellar.expert are the proof artifact.

**Mainnet deploy runbook (run from WSL):**

```bash
# 1 — Verify wallet is funded (need ≥10 XLM)
cd /mnt/d/PROJECTS/axial/soroban
stellar account balances --network mainnet --account GB6TMTI6DB6BETQEPMKXOAYAMYKGNHR4AJVZHKEQ5LCVFINGEDQDKCFI

# 2 — Build all contracts (fresh)
make build

# 3 — Deploy all three to mainnet
#     SOURCE = your mainnet identity name (the one holding the mainnet XLM)
make deploy-all NETWORK=mainnet SOURCE=<your-mainnet-identity>
#     Paste the three contract IDs output into soroban/deployments/mainnet.json

# 4 — Establish USDC trustline (mainnet issuer in Axial.md §13 locked decisions)
#     Run one tiny test payment to confirm USDC flows

# 5 — Update web env (if adding mainnet support)
./scripts/write-web-env.sh  # adjust for mainnet paths if needed

# 6 — Confirm on stellar.expert/public/contract/<each-id>
```

- Mainnet XLM wallet: `GB6TMTI6DB6BETQEPMKXOAYAMYKGNHR4AJVZHKEQ5LCVFINGEDQDKCFI`
- Mainnet USDC issuer: `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`
- **References:** [`../soroban/README.md`](../soroban/README.md), `Axial.md` §13.8–13.9, depends on **S0-4** ✅

### S0-6 · Demo recording + ≥3 dry runs · `P0` · 🔴 todo
Record a clean end-to-end demo. Have the recording ready as a fallback before the
live presentation. All routes are now at `/app/*`.

**Demo shot list (in order):**

1. **Landing** — open `/` · show tagline, problem cards, 5-step flow · click "Launch testnet demo"
2. **Overview** (`/app`) — EIS pulse live · treasury USDC · testnet badge visible
3. **Liquidity** (`/app/liquidity`) — upload a real PDF invoice (or hit seed) · row appears in table
4. **Confirm payer** — click "Confirm payer" demo PATCH · status changes to Fundable
5. **Tokenize & Swap** — click "Tokenize & Swap" · toast pipeline runs · row shows USDC settled
6. **Compliance** (`/app/compliance`) — expand a submission row · show 20 BIR fields + JWS preview + Stellar memo link
7. **Route Payroll** — enter gross · click route · toast appears · check Compliance feed updates
8. **Overview** — return · EIS pulse updated · treasury balance changed
9. **Settings** (`/app/settings`) — show Audit Logs (now live EIS events, not hardcoded dates)

- **References:** [`flow.md`](flow.md) §3 (sequence diagram), `Axial.md` "Implementation status"

### S0-7 · Sync docs before repo push · `P1` · 🟡 in progress
S0-1/2/3/4 are reflected in this file. CLAUDE.md updated for routing change (`(app)`
→ `app` segment, `/app/*` routes, landing at `/`). Remaining: update `Axial.md`
implementation status table once all S0 tasks land; update `flow.md` if routing
change affects the diagrams (route labels only — no functional change).
- **References:** [`Axial.md`](Axial.md), [`flow.md`](flow.md), [`../CLAUDE.md`](../CLAUDE.md)

### S0-8 · Brand identity — logo & favicon · `P1` · 🟡 in progress
Official Axial logo created: an open-apex "A" — two structural beams bridged by a
teal axial crossbar (the *axis* in Axial; the live/active accent). Single source of
truth in `web/components/ui/Logo.tsx` (`LogoMark` + boxed `Logo` lockup).

**Done:**
- `LogoMark` / `Logo` components · favicon `web/app/icon.svg` (replaces the Next.js default)
- Wired into the sidebar header, landing nav, and landing footer
- "Axial MVP" → "Axial" across UI + docs · root metadata upgraded with a title template

**Remaining — logo/favicon rollout:**
- `web/app/apple-icon.tsx` — 180×180 Apple touch icon via `next/og` `ImageResponse`
- `web/app/opengraph-image.tsx` — 1200×630 social share card; add `metadataBase` to root layout
- `web/app/manifest.ts` — PWA manifest (name, theme color `#0B0E14`, icon references)
- Multi-resolution `favicon.ico` for legacy browsers (optional — SVG covers modern browsers)
- Remove unused Next.js scaffolding from `web/public/` (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`)
- Add the logo + a brand-assets section to `README.md` and `docs/dsd-axial.md`
- **References:** [`../web/components/ui/Logo.tsx`](../web/components/ui/Logo.tsx), [`../web/app/icon.svg`](../web/app/icon.svg), [`dsd-axial.md`](dsd-axial.md)

---

## Production Roadmap

> **Commitment:** Axial ships as a fully production-ready system — not a hackathon
> artifact. Every item below is scoped and committed, not optional. The roadmap
> closes the gap between the current testnet demo and a production-credible
> liquidity-and-compliance platform: real settlement integrity, self-custody,
> event-driven compliance, and multi-tenancy.
>
> Development is agent-driven and spec-first — directives in `docs/`, deterministic
> execution, self-annealing on every failure. Aggressive scope is the default; we
> do not downgrade the product to fit a timeline.

**Roadmap phases** — items below keep their `B-n` IDs; this table is the build order:

| Phase | Theme | Items |
|---|---|---|
| **P1 — Settlement integrity** | Close the payment-redirection gap; make the closed loop real | B-1 payer portal · B-2 on-chain lockbox + reconciliation |
| **P2 — Self-custody & compliance** | Remove custodial risk; event-driven, real BIR submission | B-3 Freighter · B-4 T+3 worker + Horizon subscription · B-7 real BIR EIS (PTT) |
| **P3 — Platform & scale** | Multi-tenant platform, live FX, fiat rails | B-6 auth + multi-tenancy · B-5 Reflector FX · B-8 SDD reconcile · B-9 PDAX (gated on access) |

> External gating, tracked but not blocking: B-7 needs a BIR Permit to Transmit;
> B-9 needs PDAX sandbox access. The rest of the build proceeds independently.

### B-1 · Payer portal — KYB onboard + invoice confirm + NoA e-acknowledgement · `P0` · 📋 committed
Step 0 of the core workflow. Today the MSME clicks "confirm payer" on its own behalf —
that *is* the payment-redirection fraud the settlement-integrity review exists to
close. Build a real payer-facing surface: payer KYB onboarding, invoice confirmation,
and NoA e-acknowledgement, signed from the payer's own session.
- **References:** [`rfc-axial-closed-loop-settlement.md`](rfc-axial-closed-loop-settlement.md), [`clr-axial.md`](clr-axial.md) (NoA legal text), `Axial.md` §7.1 Step 0, `../web/lib/msme/invoice-trust.ts`, `../web/app/api/invoices/[id]/route.ts`

### B-2 · On-chain lockbox / settlement contract + reconciliation worker · `P0` · 📋 committed
Replace the `mark_collected` demo PATCH with a real collection path: a designated
lockbox address per invoice, a `settlement` Soroban contract (repay funder, release
reserve, return margin), and a reconciliation worker that auto-freezes the MSME and
escalates on leakage by T+X.
- **References:** [`soroban/CONTRACTS.md`](../soroban/CONTRACTS.md) (`settlement` crate, P2), [`rfc-axial-closed-loop-settlement.md`](rfc-axial-closed-loop-settlement.md), `../soroban/contracts/`, `../web/app/api/invoices/[id]/route.ts`

### B-3 · Freighter wallet integration (self-custody) · `P1` · 📋 committed
Removes the custodial-signing liability (D2). MSME signs its own mint/swap; payer signs
from the payer portal. Build-unsigned-tx-on-server → sign-in-browser → submit, with
testnet/mainnet network switching and a real "connected wallets" Settings surface.
- **References:** `../web/lib/soroban/invoke-receivable.ts`, `invoke-swap.ts`, `invoke-payroll.ts`, `config.ts`, `../web/components/views/SettingsView.tsx`, `Axial.md` Q7

### B-4 · T+3 submission worker + Horizon event subscription · `P1` · 📋 committed
The oracle currently submits immediately and is triggered by API hooks. Add a real T+3
scheduled submission worker and a Horizon/RPC ledger-event subscription so compliance
is event-driven, not request-driven.
- **References:** `../web/lib/eis/oracle.ts`, `../web/lib/eis/trigger.ts`, [`rfc-axial-eis-oracle.md`](rfc-axial-eis-oracle.md), [`sdd-axial.md`](sdd-axial.md) §5

### B-5 · Reflector FX oracle — replace hardcoded rate · `P2` · 📋 committed
The PHP/USDC rate is hardcoded (`DEMO_RATE = 56.5`). Wire the Reflector price oracle
and write the rate used to the contract event log so it is auditable (Axial.md §13.8).
- **References:** `../web/components/settings/PdaxRampCard.tsx`, `Axial.md` Q4 + §13.8

### B-6 · Auth + multi-tenancy · `P1` · 📋 committed
The app is single-org with no real auth — `(app)/layout.tsx` is a visual shell only.
Add login, org invites (OIDC preferred per Axial.md §11), and tenant scoping.
- **References:** `../web/app/(app)/layout.tsx`, `../web/components/providers/AppProvider.tsx`, `Axial.md` §11 (Auth mechanism)

### B-7 · Real BIR EIS integration (PTT certification path) · `P2` · 📋 committed
Replace the mock BIR endpoint and mock JWS with the real BIR EIS API and a
vault-mediated signing key once a Permit to Transmit is obtained.
- **References:** `../web/lib/eis/bir-mock.ts`, `../web/lib/eis/jws.ts`, `../web/app/api/bir/eis/route.ts`, [`clr-axial.md`](clr-axial.md), `Axial.md` §9.1

### B-8 · Reconcile the stale SDD backend architecture · `P2` · 📋 committed
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
