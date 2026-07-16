# Axial — Foundation Document

**Version:** 1.1  
**Date:** 2026-05-14  
**Status:** Living Document — update as product thinking evolves

> This document is the canonical source of truth for Axial's origin, thinking, and identity. It is the primary input for all other product documents (BRD, PRD, SDD, DSD, GTM). When those documents conflict with this one, resolve the conflict here first, then propagate.

---

## FOR DEVS + TL;DR

> If you read nothing else in this doc, read this section. The rest is the *why*; this section is the *what*. Updated **2026-05-14** alongside doc version 1.1.

### What we're building (one paragraph)

Axial is a liquidity and compliance engine for Philippine MSMEs, built for the **Build on Stellar Philippines Hackathon 2026 (May 18–24)**. The flow: a B2B payer is onboarded and confirms an invoice (acknowledging a Notice of Assignment) → the MSME tokenizes that confirmed receivable on Soroban → an atomic swap funds the MSME instantly in USDC on Stellar (advance with reserve + recourse) → a Soroban payroll contract splits the next bi-weekly payroll across SSS, PhilHealth, and Pag-IBIG → an off-chain oracle maps the ledger-final event into a BIR-EIS-ready JSON payload and JWS-signs it, then surfaces it for **human review and one-click submission** within T+3 (mock endpoint today; live transmission gated on BIR software certification + Permit to Transmit), writing the reference back to the Stellar transaction memo. UI is four tabs (Liquidity, Compliance, Overview, Settings), dark-mode-first, glassmorphic, calm. Brand archetype is **The Architect** — never alarmist, never data-soup.

### What changed in this latest review (locked decisions)

After fact-checking against current sources and aligning to PDAX (hackathon main sponsor), several earlier assumptions were retired (2026-05-14 review):

| Old assumption | Status | Locked decision |
|---|---|---|
| Atomic swap into **PHPC** on Stellar | ❌ Retired | PHPC is on Polygon and Ronin Network, **not Stellar**. Exited the BSP sandbox July 5, 2025. |
| Settlement asset = PHPC | ❌ Retired | **Settlement asset = USDC on Stellar.** Circle-issued, on Mainnet, no external dependencies. |
| Direct QRPh integration via Stellar SDK | ❌ Retired | QRPh requires BSP-licensed PSP/EMI status. Not buildable as a third-party SDK. Handled at the PDAX/anchor edge. |
| BIR EIS "non-negotiable for 100% of formalized MSMEs" | ⚠️ Softened | Applies to **Phase 1** taxpayers only (Large Taxpayers Service, e-commerce, exporters, ₱1B+ gross sales, CAS/CBA users). Micro-taxpayers are exempt. Future phases TBD by BIR. |
| PHP fiat rail unclear | ✅ Resolved | **PDAX as production PHP rail** via PDAX Connect API. PDAX inherits BSP/VASP license; Axial never custodies fiat. |
| Anchor lock-in risk | ✅ Resolved | **SEP-24 abstraction layer** — PDAX is one driver; Coins.ph and future PHP-Stellar issuers can plug into the same interface without touching contract logic. |
| User-facing currency | ✅ Resolved | **UI denominates in PHP. Settlement is in USDC.** FX conversion at edges via Reflector oracle (preferred) or hardcoded rate (acceptable for hackathon). Same architectural pattern as Stripe, Wise, dLocal. |

**Settlement-integrity review (2026-05-19).** The original model assumed the B2B payer would voluntarily route payment to the smart contract. That is the single largest risk in the product: a payer who was never onboarded can simply pay the MSME the old way, leaving the funder unpaid (payment-redirection fraud). The following decisions close that hole and are now **locked** — they convert Axial from open factoring into a **closed-loop, confirmed-invoice financing system**. Do not reopen without editing this section first.

| Decision | Status | Locked decision |
|---|---|---|
| Funding eligibility | ✅ Locked | **Only payer-confirmed receivables are fundable.** The B2B payer (debtor) is onboarded and KYB'd into Axial and explicitly confirms the invoice and due date *before* any swap. No confirmation → no funding. This eliminates fake/inflated-invoice fraud at the root. |
| Legal collection mechanism | ✅ Locked | **Notice of Assignment (NoA) with payer e-acknowledgement.** Under PH Civil Code Arts. 1624–1635, once the debtor is notified of the assignment, paying the original MSME does **not** discharge the debt — the payer still owes Axial/the funder. Off-system payment becomes the payer's and MSME's breach, not the funder's loss. *Structural awareness only — NoA text must be reviewed by a licensed Philippine attorney.* |
| Collection path | ✅ Locked | **Designated lockbox / collection address per invoice.** The payer's only payment instruction points to an Axial-controlled Stellar address (or virtual account at the anchor edge) that routes into the settlement contract. The MSME never re-enters the money path post-funding. |
| Funder protection | ✅ Locked | **Advance < face value + reserve + recourse.** Advance ~80–90% (not 97%); a holdback reserve is retained; the MSME carries contractual recourse + personal guarantee if the payer does not settle through the system. Funders are protected by structure, never by a "this can't happen" promise. |
| Leakage handling | ✅ Locked | **Reconciliation + automatic escalation.** Invoice due but no funds in the lockbox by T+X → MSME account auto-frozen, funder notified, recourse + blacklist triggered. Leakage is detected in days, not never. |

### Build audit & final scope lock (2026-05-22)

A CTO/auditor review on Day 5 of the hackathon checked the `web/` and `soroban/` build against this document. The following are now **locked**. The prioritized task board derived from this audit lives in [`docs/sprint.md`](sprint.md).

| Item | Status | Locked decision |
|---|---|---|
| PDAX Connect (L3) | ❌ Dropped | PDAX sandbox access was **not granted**. Final hackathon scope is **L1 + L2** (L2 = our own mocked PDAX UI). No real PDAX API calls. The SEP-24 abstraction stands so PDAX can be wired post-hackathon without contract changes. |
| Wallet management (Q7) | ✅ Locked | **Custodial backend signing** for the hackathon demo — the Next.js server holds the funder/MSME/issuer secrets and signs all Soroban transactions. No Freighter/Albedo in v1. Freighter (MSME + payer self-custody) is post-hackathon roadmap. |
| Operating network — Mainnet only | ✅ Locked (2026-05-22) | Axial runs on **Stellar Mainnet only**. All 4 contracts are deployed + initialized on Mainnet (`deployments/mainnet.json`). This **reverses** the earlier "testnet is the live demo path" decision — testnet is retired as an operating target and kept only as a developer sandbox. |
| Closed-loop settlement | ✅ Wired (verify on Mainnet) | Closed loop is built and called from the app — payer portal, NoA issue/ack, reconciliation cron, `register_invoice`, Freighter lockbox funding, and on-chain `settle` on `mark_collected` (B-2 S3–S5). **Remaining:** exercise/verify on Mainnet ([`settle-dry-run-checklist.md`](settle-dry-run-checklist.md)); do not overclaim production collection ops until that dry-run is green. |
| Hardcoded demo data | ⚠️ Acknowledged | FX rate (`56.5`), Settings credentials/audit log, and seller/buyer TINs are hardcoded demo values. Acceptable for the hackathon; tracked for replacement in [`docs/sprint.md`](sprint.md). |

### PBW review & compliance pivot (2026-06-18)

Ahead of the **Philippine Blockchain Week** presentation (Day 1, SMX), we ran a scrutiny pass against industry reality and the hackathon judges' standing challenge — *"What if the company closes? What if it's a scam? How do you prevent it?"* Findings: [`scrutiny-pbw.md`](scrutiny-pbw.md); full risk register: [`rfc-axial-risk-mitigation.md`](rfc-axial-risk-mitigation.md). The following are now **locked**.

| Decision | Status | Locked decision |
|---|---|---|
| **Compliance model — human in the loop** | ✅ Locked (2026-06-18) | Reposition from *auto-submission* to a **"Compliance Co-Pilot": prepare → review → submit.** Axial maps each ledger-final event into a BIR-EIS-ready, JWS-signable payload and SSS/PhilHealth/Pag-IBIG schedules, then surfaces them for **human review and explicit approval** before submission. Auto-submission is a roadmap item, **gated on EIS software certification + Permit to Transmit (PTT)**. Rationale: filing wrong/fraudulent returns automatically is an uninsured liability, and it is the human checkpoint that answers "what if it's wrong or a scam." |
| **Primary tagline** | ✅ Locked (2026-06-18) | **"Instant Capital, Effortless Compliance."** *"Invisible Compliance"* is retired as the headline claim and kept only as the **north-star vision** (full automation, post-certification). |
| **Funder framing** | ✅ Locked (2026-06-18) | Funders are **regulated / qualified liquidity partners**, not an open on-chain pool. Factoring/discounting AR is a financing-company activity under **RA 8556** (SEC Certificate of Authority), and assigned receivables may transfer only to defined regulated buyers. Axial presents as **tech + origination rails on top of a licensed financing entity**. Entity/CA posture → **counsel** ([`clr-axial.md`](clr-axial.md)). |
| **Honesty about dependencies** | ✅ Locked (2026-06-18) | Stop calling USDC "no external dependency." Name **Circle counterparty + freeze/blacklist risk** and **PHP/USDC FX risk** openly as managed risks (mitigated by denomination-agnostic contracts). |
| **PBW framing** | ✅ Locked (2026-06-18) | This is an **industry talk**, not a hackathon pitch. The 2nd-Runner-Up win is **evidence**, not the headline. Lead with the change in the world (BIR e-invoicing + real-time CTC), not the competition. |

### Locked architecture in one paragraph

The **user-facing layer denominates everything in pesos** (invoices, payroll previews, compliance dashboards). The **settlement layer uses USDC on Stellar** — Soroban contracts for SAC mint, atomic swap, statutory payroll routing, and settlement, all written denomination-agnostic so the asset address is a parameter. The **compliance layer is an off-chain Co-Pilot** that subscribes to Stellar ledger events, maps each reportable event to the BIR EIS 20-field schema, JWS-signs in a vault-mediated key context, **surfaces the filing for human review and approval**, then submits to BIR with idempotency keys on approval (auto-submit gated on Permit to Transmit), and writes the success reference back as a Stellar memo. The **fiat edge** is handled by PDAX (or any SEP-24 anchor) — Axial itself never touches PHP cash.

### Hackathon demo strategy — three layers

Build **L1 first**. L1 alone is a complete, judge-able submission. L2 enriches the demo without adding external dependency. **L3 was scoped out (2026-05-22)** — PDAX sandbox access was not granted; final hackathon scope is **L1 + L2**. See "Build audit & final scope lock" above.

| Layer | What's real (live on Mainnet / working) | What's mocked | External dependency |
|---|---|---|---|
| **L1 — must ship** | Soroban contracts deployed to Mainnet · real USDC atomic swap · payroll split contract · BIR EIS oracle service · JWS-signed payload to mock BIR endpoint · Stellar memo write-back of success reference | Fiat in/out (rendered as labeled placeholder screens) | None |
| **L2 — nice to have** | Everything in L1 | PDAX UI screens for PHP↔USDC ramp drawn by us | None — we draw the screens |
| **L3 — not pursued** | ~~Real PDAX Connect API calls behind the L2 mocked UI~~ | — | ❌ PDAX sandbox access **not granted (2026-05-22)** — dropped from scope |

### Day-by-day skeleton (3 devs × 7 days ≈ 21 dev-days)

| Day | Date | Focus |
|---|---|---|
| **Day 1** | Mon May 18 | Repo + envs · Soroban skeleton · UX shell wiring · USDC trustlines on demo wallets · SEP-24 interface defined · CI green |
| **Day 2** | Tue May 19 | SAC mint contract · atomic swap contract (denomination-agnostic) · PostgreSQL schema + migrations · auth scaffolding |
| **Day 3** | Wed May 20 | Statutory payroll router contract · BIR EIS field mapping (off-chain) · oracle event subscription wired to Stellar testnet |
| **Day 4** | Thu May 21 | JWS signing in vault-mediated context · mock BIR endpoint · idempotency keys · Stellar memo write-back · happy-path E2E on testnet |
| **Day 5** | Fri May 22 | **Mainnet contract deploy** · real USDC swap end-to-end on Mainnet · L2 mocked PDAX UI · architecture slide for multi-anchor story |
| **Day 6** | Sat May 23 | UX polish (four tabs, calm states, glassmorphic surfaces) · copy pass · Overview tab "all green" state · narrative tightening |
| **Day 7** | Sun May 24 | Demo recording · dry runs (at least 3) · judge-facing materials · **buffer for Mainnet weirdness** |

### Parallel work streams

| Stream | Suggested owner | Surface area |
|---|---|---|
| **Smart contracts** (Soroban + Rust) | Aidan or Rhandie | Contracts, deploy scripts, Mainnet ops, vault setup, USDC trustline ops |
| **Backend** (Next.js API routes + workers + oracle) | Gerald | API routes, PostgreSQL, Redis, EIS oracle, idempotent submission worker, mock BIR endpoint |
| **Frontend** (UI + UX + design system) | Whoever isn't on contracts | Four tabs, dark glassmorphic surfaces, Material Symbols icons, Geist typography, microcopy |

**Carlos owns:** PDAX Connect outreach (this week), demo narrative, judge-facing slides, the multi-anchor architecture story.

### Implementation status (May 2026)

Snapshot of what ships in **`web/`** today vs locked product vision. Visual tab map and sequence diagrams: **`docs/flow.md`**.

| Area | Status | Notes |
|------|--------|-------|
| Soroban L1 (mint, swap, payroll) | ✅ Mainnet | Happy path wired from Liquidity + Compliance |
| BIR EIS oracle / Co-Pilot (20 fields, JWS mock, memo) | ✅ | Chain events prepare JWS payloads (`prepared`); Compliance **Approve** → BIR submit (`POST /api/eis/[id]/approve`). Demo auto-ack only when `AXIAL_ALLOW_SEED` or `EIS_DEMO_AUTO_ACK` (never when `BIR_EIS_LIVE`). Migrations `007` (`prepared` status), T+3 columns mapped in Supabase store |
| T+3 submission worker | ✅ | `eis/worker` cron — retries `failed` inside T+3; expires `prepared`/`failed` past `dueBy`; does **not** auto-submit awaiting-review rows. Production fails closed if `CRON_SECRET` unset |
| Horizon event poll | ✅ | `eis/horizon-poll` cron — skips `prepared`/`submitted`/`acknowledged`/`memo_written`; production fails closed if `CRON_SECRET` unset |
| Reconciliation / leakage scan | ✅ | `reconciliation/scan` cron — daily leakage scan; production fails closed if `CRON_SECRET` unset |
| Factoring book | ✅ | `factoring_invoices` + `/api/invoices` pagination; OCR parse persists rows; face rewrite blocked once payer-confirmed/fundable; `face_usdc` / `attributed_inflow_usdc` (migration `009`) |
| Payer portal + NoA | ✅ | `/app/payer-portal` (token auth); NoA ack **requires** confirmation token; confirm GET redacts `authToken`; eligibility fail-closed on swap (unless seed) |
| Auth / multi-tenancy | ✅ | Supabase SSR auth, org-scoped data, invites (`api/auth/*`, migration `006`) |
| Overview / Liquidity metrics | ✅ | `GET /api/dashboard/summary` — book face PHP, treasury USDC, contract count |
| Treasury card | ✅ | `GET /api/wallets/balances` on Overview — Mainnet balances |
| FX rate (Reflector) | ✅ | `lib/fx/reflector.ts` + `/api/fx/rate` — live oracle, hardcoded 56.5 PHP/USDC fallback |
| Public landing page | ✅ | Marketing landing at `/`; `/app` is the authenticated Overview |
| PDAX ramp (L2) | ✅ UI | Settings demo card; **L3 Connect API not pursued — sandbox access not granted (2026-05-22)** |
| Wallet signing | ✅ Custodial | Server-side signing with funder/MSME/issuer secrets; optional Freighter client-sign path (Q7 locked custodial 2026-05-22) |
| On-chain lockbox enforcement | ✅ | `settlement` on Mainnet; `register_invoice` **awaited** after swap; Freighter lockbox fund converts **PHP→USDC** (Reflector); `mark_collected` uses `settling` then collected (reverts on chain fail); attributed inflow cap; stable on-chain invoice id (= business id). **S6** trust model in [`rfc-axial-closed-loop-settlement.md`](rfc-axial-closed-loop-settlement.md) |
| Funder Protection Center + portal | ✅ | `/api/funder/*`, embedded in Liquidity, `/app/funder-portal` (token or session) |
| Trust & Boundary ack gate | ✅ | Settings card + tokenize blocked until acknowledged (draft counsel copy) |
| Payer dispute workflow | ✅ | `/api/disputes`, payer portal, eligibility `disputed` blocker |
| Calm notification center | ✅ | TopBar bell, `/api/notifications`, emitters on fund/leak/EIS fail |
| Org EIS tax profile | ✅ | Per-org seller/buyer TIN in Settings; feeds EIS payload |
| Payer KYB modes | 🟡 | `AXIAL_KYB_MODE=mock\|manual\|vendor`; manual verify in PayerPanel |
| Statutory payroll tables | ✅ | Versioned `lib/payroll/statutory-tables.ts` + effective-dated quotes |
| EIS stuck-submission monitor | ✅ | `GET /api/eis/monitor` (cron-ready) |
| Operating network | ✅ | **Stellar Mainnet** — all 4 contracts deployed + initialized; the system runs Mainnet-only |
| Live BIR submission | ⬜ | Mock BIR by default; `BIR_EIS_LIVE` gates the real client (needs Permit to Transmit) |

Audit-derived task board: [`docs/sprint.md`](sprint.md).

**Demo order:** Overview (treasury) → Liquidity (upload or seed row → confirm payer → tokenize & swap) → Compliance (payroll + EIS) → Settings (PDAX toast).

### Deliverables
- **Pitch Deck:** [Interactive HTML](pitch-deck.html) | [PDF Export](pitch-deck.pdf)

### Open questions for the dev team

Decisions Carlos doesn't have a strong opinion on. Resolve early so they don't bottleneck later. **Pick one and move** — bias toward decisions you can reverse cheaply.

| # | Question | Why it matters | Suggested deadline |
|---|---|---|---|
| Q1 | **BullMQ vs Temporal** for the EIS submission worker? | T+3 scheduling + retries; Temporal is bulletproof but heavier; BullMQ is simpler and matches existing JS stack | Day 1 |
| Q2 | **REST + OpenAPI vs tRPC** for the API between frontend and backend? | tRPC is tighter inside a TS monorepo; REST/OpenAPI matches BIR's API shape and external integrations | Day 1 |
| Q3 | **Single Soroban contract or several smaller ones?** | One contract = simpler deploy; several = testable in isolation, cleaner upgrade story | Day 2 |
| Q4 | **Reflector vs hardcoded FX rate** for PHP/USDC conversion? | Reflector signals Stellar-ecosystem mastery; hardcoded ships faster. Hybrid: hardcoded behind a feature flag, swap to Reflector if time permits | Day 2 |
| Q5 | **How to handle FX risk during swap-to-payroll window?** | Lock rate at swap time (Reflector reading written to contract storage)? Float and reconcile? Hackathon answer can be "out of scope, addressed in production roadmap" | Day 3 |
| Q6 | **Mock BIR EIS endpoint design** — separate service or in-process route? | Affects demo realism. Separate service feels more real; in-process is faster to build | Day 3 |
| Q7 | **Wallet management for the demo accounts** — Freighter, Albedo, or custodial backend signing? | Freighter is the standard Stellar browser wallet; custodial is easier for a clean demo UX. Decision affects what judges see on stage | ✅ **Resolved: custodial** (Build audit 2026-05-22) |
| Q8 | **Hosting target** — Vercel, Railway, Render, fly.io? | Affects API latency to Stellar RPC and (eventually) BIR. Asia-Pacific region preferred | ✅ **Resolved: Google Cloud Run** (`asia-southeast1`) |
| Q9 | **Idempotency key strategy** for EIS submissions | `{org_id}:{stellar_tx_hash}:{invoice_id}` is suggested in SDD; team should sanity-check before implementing | Day 3 |
| Q10 | **How explicit is "demo mode" in the UI?** | Demo-mode banner? Watermark? "Testnet" badge? Affects whether judges think it's real | Day 6 |
| Q11 | **Lockbox implementation for the demo** — dedicated Soroban collection contract vs per-invoice Stellar address vs anchor virtual account? | Drives the closed-loop demo; contract is most on-chain-native, address is simplest | Day 2 |
| Q12 | **NoA e-acknowledgement UX** — in-app click-to-accept vs signed PDF vs both? | Legal weight vs demo speed; click-to-accept is fine for demo, signed artifact needed for production. See [`clr-axial.md`](docs/clr-axial.md) | Day 3 |

### Resources

**Stellar / Soroban**

| Resource | Link |
|---|---|
| Soroban docs (smart contracts overview) | https://developers.stellar.org/docs/build/smart-contracts/overview |
| Soroban examples (token, atomic swap, timelock) | https://github.com/stellar/soroban-examples |
| OpenZeppelin Stellar Contracts (audited base patterns) | https://github.com/OpenZeppelin/stellar-contracts |
| Anchor Platform docs (SEP-24 reference impl) | https://developers.stellar.org/api/anchor-platform |
| SEP-24 — Hosted Deposit and Withdrawal | https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0024.md |
| SEP-31 — Cross-Border Payments API | https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0031.md |
| SEP-10 — Stellar Authentication | https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md |
| Stellar Laboratory (testnet ops, friendbot) | https://laboratory.stellar.org/ |
| Reflector — Stellar-native price oracle | https://reflector.network/ |
| Soroban CLI install | https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup |
| **USDC issuer on Stellar Mainnet** | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| Circle testnet USDC faucet | https://faucet.circle.com/ |

**BIR EIS (Philippines)**

| Resource | Link |
|---|---|
| EIS Certification Portal | https://eis-cert.bir.gov.ph/ |
| PwC summary of EIS coverage (RR 11-2025, RR 26-2025) | https://www.pwc.com/ph/en/tax/tax-publications/taxwise-or-otherwise/2025/paperles-invoicing-and-sales-reporting.html |
| Sprout summary (mandate scope, self-assessment checklist) | https://sprout.ph/articles/bir-online-einvoicing-filing-payments/ |

**Statutory tables (must be legally reviewed before production)**

| Agency | Link |
|---|---|
| SSS contribution schedule | https://www.sss.gov.ph/ |
| PhilHealth premium contribution | https://www.philhealth.gov.ph/ |
| Pag-IBIG contribution | https://www.pagibigfund.gov.ph/ |

**Partner (PDAX)**

| Resource | Link |
|---|---|
| PDAX Connect — apply for API access | https://connect.pdax.ph/ |
| PDAX CAAS / Platform Solutions | https://pdax.ph/caas/ |
| PDAX main site | https://pdax.ph/ |

**Frontend (Next.js app in `web/`)**

| Resource | Link |
|---|---|
| Next.js 15 docs | https://nextjs.org/docs |
| React 19 docs | https://react.dev/ |
| Tailwind CSS 4 | https://tailwindcss.com/ |
| Geist font | https://vercel.com/font |
| Material Symbols | https://fonts.google.com/icons |

### Strategy notes from Carlos (read before Day 1)

A few principles to internalize before writing any code:

1. **Build L1 first, completely, before touching L2 or L3.** L1 is the demo. Everything else is upside. The graveyard of hackathon submissions is full of teams who started building "the cool extra thing" before the core flow worked end-to-end.
2. **Mainnet is real money and real reputation.** Deploy contracts to Mainnet on Day 5, not Day 7. Anything that touches Mainnet for the first time at hour 167 will break in a way you don't expect.
3. **Calm beats clever in the UI.** The brand is The Architect, not The Disruptor. No `URGENT`, no all-caps banners, no looping animations. Read [DSD §9](docs/dsd-axial.md) (microcopy) before writing any user-facing string.
4. **Treat the BIR EIS oracle as the centerpiece of the demo.** It is the part of Axial that no other hackathon team will build. The atomic swap is table stakes; the EIS submission with the BIR success reference written back to a Stellar memo is the moment that wins Real-World Impact points.
5. **If the demo glitches, fall back to recorded video.** Have a clean recording by Day 7 morning regardless. Live demos break.
6. **PDAX is a sponsor and an opportunity, not a dependency.** Reach out, then forget about them. If they respond, L3 lights up. If they don't, L1+L2 wins the hackathon. *(Outcome 2026-05-22: PDAX sandbox access was not granted — L3 dropped, L1+L2 is the final scope.)*
7. **The four tabs are a constraint, not a target.** Don't add a fifth tab. Don't merge two. Liquidity, Compliance, Overview, Settings — fixed order. See §7.3 and [DSD §5](docs/dsd-axial.md).

---

## 1. Where We Started: The Catalyst

Axial was conceived for the **Build on Stellar Philippines Hackathon 2026** — a 7-day, online builder-first event running **May 18–24, 2026**, organized to empower Filipino fintech innovators to build MVPs using the Stellar blockchain that tackle real financial challenges. The event's theme was **"Real-World Financial Solutions for Filipinos"**, with a dedicated focus area on **MSME & Commerce Tools** (invoicing, payroll, cashflow for small businesses).

**Why the hackathon mattered as a forcing function:** The format — 7 days, working MVP, deployed on Stellar Testnet and Mainnet, public demo — forced decisions that pure ideation does not. We could not build everything; we had to find the single most urgent, structurally important, and technically tractable problem in the Philippine MSME landscape. That discipline is what produced Axial.

**Prize context (₱60,000 total pool):** Not the primary motivation, but a signal that this is a legitimate institutional initiative, not a weekend hobby. More importantly, the judging criteria weighted **Real-World Impact (30%)** and **Technical Execution on Stellar (25%)** above everything else — rewarding infrastructure over gimmick.

---

## 2. The Research Phase: What We Found

Before writing a single line of code or naming anything, we ran a structured research pass on the Philippine MSME sector. The following facts are the load-bearing inputs that shaped every subsequent decision.

### 2.1 The Macroeconomic Baseline

The Philippine MSME sector is structurally massive and structurally underserved at the same time:

| Metric | Data Point | Source/Notes |
|---|---|---|
| MSME share of all business establishments | 99.5–99.63% | PSA 2022–2024 (DTI MSME Statistics); ranges by year |
| MSME share of total employment | 65.1% (PSA 2022) / 66.6% (ADB end-2024) | Two recent measurements both ~65% |
| MSME contribution to national GDP | ≈35–45% | Cited figures vary by year and methodology: ISSI cites 35.7% value-added; UNDP cites ~40% GDP; older DTI sources cite 45.5% |
| Estimated MSME funding demand (Philippines) | $221 billion | Visa Philippines, May 2025 |
| Actual formal MSME funding supply | $15 billion | Visa Philippines, May 2025 |
| Fully digitalized MSMEs (using ERP/CRM) | ~10% | 2020–2022 surveys; directionally consistent with more recent reporting |
| MSMEs relying on basic tools (email/messaging) | ~56% | 2020–2022 surveys; directionally consistent with more recent reporting |

The gap between establishment density (≈99.6% of all businesses) and GDP contribution (≈35–45% depending on methodology) is the diagnostic. It points to chronic undercapitalization and operational bottlenecks preventing MSMEs from scaling efficiently — not a lack of hustle or ambition.

Philippines GDP growth is forecast at 5.3% and the government projects digital economy GDP contribution could reach 12% by 2026 — but only around 10% of MSMEs are fully digitalized (per 2020–2022 surveys, directionally consistent with current reporting). The gap between ambition and reality is where Axial lives.

### 2.2 The Three Structural Problems

Our research identified three categories of acute, compounding pain:

**Problem A — The Liquidity Trap (Accounts Receivable vs. Payroll Mismatch)**

B2B MSMEs operate on Net 30 to Net 90 payment terms enforced by enterprise buyers, while Philippine labor law mandates bi-weekly payroll. A business with 30% year-over-year revenue growth can face technical insolvency because its cash is locked in 60-day receivables while payroll triggers every 14 days. Business owners described it precisely: *"Revenue is up, but cash timing is broken. Biweekly payroll plus Net 60 will always create pressure."*

The structural liquidity mismatch:
| | Timeline | Impact |
|---|---|---|
| Inbound revenue (accounts receivable) | Day 30–90 | Cash trapped in completed work |
| Outbound liability (payroll/operations) | Day 14 and Day 28 | Mandatory capital drain |
| The bridge gap | 16–76 days | Requires expensive LOCs or growth halts |

Traditional options — early payment discounts (1–5% of revenue), short-term invoice factoring, lines of credit — are expensive and inaccessible to most MSMEs without physical collateral.

**Problem B — The Digital Ad Tax Bleed (BIR RMC 5-2024)**

Every MSME spending on Meta, Google, or TikTok ads triggers BIR Revenue Memorandum Circular No. 5-2024 (clarified by RMC 38-2024 and RMC 24-2026). Payments to Non-Resident Foreign Corporations (NRFCs) are subject to 25% Final Withholding Tax plus 12% VAT under reverse-charge. The devastating detail: foreign platforms bill gross, they do not honor PH withholding deductions. The MSME pays out of pocket.

The unit economics destruction:
| Item | PHP | Note |
|---|---|---|
| Gross media spend to Meta | ₱1,000,000 | Auto-debited from card |
| Agency service fee | ₱100,000 | Expected profit margin |
| Out-of-pocket 25% FWT remittance | (₱250,000) | Required by BIR; unrecoverable |
| Net result | **(₱150,000) loss** | Profitable campaign becomes a cash drain |

Standard Western accounting tools (Xero, QuickBooks) are not built for this reconciliation anomaly. Foreign platforms do not issue receipts with valid Philippine TINs. Audit exposure is severe.

**Problem C — The BIR EIS Mandate and Manual Statutory Payroll**

The Bureau of Internal Revenue's Electronic Invoicing System (EIS), mandated under the TRAIN Act and expanded by the Ease of Paying Taxes Act (RA 11976), requires:
- Invoices formatted as JSON/XML with at least **20 mandatory fields** (including VAT breakdowns)
- Secure API transmission to BIR within **T+3 (3 calendar days)** of the transaction
- **JSON Web Signature (JWS)** to ensure tamper-evidence
- Compliance deadline: **December 31, 2026** — immovable

For the 56% of MSMEs managing finances via spreadsheets and email: this is an existential technological barrier. Non-compliance means severe tax penalties **and** exclusion from B2B supply chains, as compliant corporate buyers will refuse non-EIS paper documentation.

Concurrently, statutory payroll (SSS, PhilHealth, Pag-IBIG) remains entirely manual for most MSMEs — complex contribution brackets, three separate government portals, bi-weekly reconciliation. When SSS contribution rates increased, MSMEs on manual spreadsheets failed to update formulas and accumulated months of under-remittance penalties.

### 2.3 Why Existing Tools Fail

The root diagnosis: **Traditional SaaS tools are data repositories, not financial infrastructure.** A cloud accounting spreadsheet records the lack of cash; it does not generate cash. It records a tax liability; it does not execute the payment. The market requires infrastructure where the money itself is intelligent, programmable, and intrinsically linked to compliance reporting.

The Stellar blockchain provides exactly this architecture:
- **Programmable PHP-pegged settlement** — Currently no production Stellar-native PHP stablecoin exists; PHPC (Coins.ph) issued on Polygon and Ronin Network exited the BSP regulatory sandbox in July 2025, and QRPh integration is a Coins.ph/Ronin-side initiative pending full regulatory clearance. Axial settles on Stellar using **USDC** with PHP at the user-facing layer; PHP fiat rail handled by regulated anchors like PDAX. See "FOR DEVS + TL;DR" at the top of this doc.
- **Soroban smart contracts** — Rust-based, Turing-complete, encodes business logic and automated financial routing on-chain
- **Stellar settlement** — Transactions in 3–5 seconds, 99.99% uptime, fractions of a cent per operation
- **QRPh** — National QR payment standard (~600,000+ merchant acceptance points) for fiat PHP movement. Not directly accessible by Stellar contracts — requires a BSP-licensed PSP/EMI partner (PDAX, Coins.ph, Maya, GCash, etc.) at the edge.
- **Bitwave enterprise bridge** — Translates on-chain activity to GAAP/IFRS-compliant reporting for traditional ERPs

---

## 3. What We Considered: The Three Candidate Solutions

The research surfaced three distinct blockchain-enabled solutions, each targeting a different one of the three structural problems. We evaluated all three seriously before deciding which to pursue.

> **Editor's note (May 14):** All three candidates as originally evaluated assumed a PHP-pegged stablecoin (PHPC) would be natively available on Stellar. Later fact-checking established that PHPC is issued on Polygon and Ronin Network, not Stellar, and exited the BSP regulatory sandbox in July 2025. The candidate concepts below are preserved as a record of our original thinking; their core architectural ideas remain valid when redesigned around **USDC settlement with PHP at the UX layer**, which is the locked Axial architecture (see "FOR DEVS + TL;DR" at the top of this doc and §13.8 for the production design).

### Candidate 1 — Soroban-Powered Tokenized Invoice Factoring

**Target:** Problem A (Liquidity Trap)

**The concept:** A dApp enabling MSMEs to tokenize verified accounts receivable into Stellar Asset Contracts (SAC), then access instant, collateral-free working capital from institutional liquidity pools via atomic swaps.

**The workflow:**
1. MSME generates invoice for verified B2B client → Soroban smart contract mints a token representing the receivable
2. Institutional lenders or decentralized liquidity pools evaluate on-chain history and advance ~97% of face value
3. `atomic_swap` executes: MSME receives PHPC instantly, bypassing the 60-day wait
4. On Day 60, buyer settlement routes to the smart contract → liquidity provider repaid → margin returned to MSME

**Why it works:** Shifts underwriting from physical collateral to deterministic code execution and receivable quality. Makes factoring of micro-invoices (₱30k–₱100k) economically viable for the first time. Directly attacks the $221B funding gap.

### Candidate 2 — Programmable Corporate Treasuries (Digital Ad Tax)

**Target:** Problem B (RMC 5-2024 compliance)

**The concept:** A programmable corporate treasury combining PHPC stablecoins, Soroban smart contracts, and Bitwave ERP integration. Intercepts cross-border digital marketing payments, calculates FWT and VAT, routes funds to compliance escrow, syncs to Xero/QuickBooks.

**The workflow:**
1. MSME funds a Stellar multi-sig treasury account with PHPC, linked to a virtual corporate card
2. When media spend to Meta is initiated, a Soroban contract detects the NRFC merchant code
3. Instead of a gross credit card deduction, the contract executes `atomic_multiswap`: pays Meta via USDC, simultaneously calculates 25% FWT + 12% VAT, locks that amount in a BIR-designated escrow
4. Bitwave pushes two categorized line items to Xero/QuickBooks: advertising expense + statutory tax liability

**Why it works:** Structurally prevents MSMEs from accidentally spending tax liabilities. Provides cryptographic audit trail proving RMC 5-2024 compliance.

**The limitation we saw:** This solution serves a narrower subset — specifically MSMEs spending significant budget on digital advertising from foreign platforms. It's a real and urgent problem (especially for marketing agencies) but a different product category from liquidity infrastructure. It requires its own go-to-market, its own onboarding, and its own compliance posture.

### Candidate 3 — Unified EIS API & Statutory Payroll Bridge

**Target:** Problem C (BIR EIS mandate + manual statutory payroll)

**The concept:** An integrated merchant payment gateway and payroll application using Stellar settlement finality as the trigger to automatically format, sign, and transmit BIR-compliant JSON data, while simultaneously splitting payroll funds to statutory agencies.

**The workflow:**
1. MSME invoice is paid via QRPh → transaction settles on Stellar in PHPC
2. The moment consensus is achieved (3–5 seconds), an off-chain oracle pulls metadata and maps it to the 20 mandatory BIR EIS fields
3. Oracle applies JWS signing and transmits to BIR EIS API within T+3 — BIR success reference ID written back to Stellar transaction memo as immutable proof
4. At bi-weekly payroll, a Soroban contract replaces manual spreadsheets: calculates exact SSS, PhilHealth, and Pag-IBIG deductions (employee + employer shares) and routes to respective government agency wallets in real-time

**Why it works:** Turns regulatory compliance from a labor-intensive chore into an invisible background process. MSMEs achieve total tax and payroll compliance simply as a byproduct of receiving and sending money.

---

## 4. The Convergence Decision: Why We Merged Candidates 1 + 3

This was the most consequential decision we made, and it deserves a full explanation.

### What we kept

We combined Candidates 1 (Tokenized Factoring) and 3 (EIS + Payroll Bridge) into a single unified infrastructure. The result is Axial.

### The logic for merging

**They share the same root cause.** The liquidity trap (Candidate 1) and the compliance burden (Candidate 3) are not independent problems — they are two faces of the same structural failure. The root cause in both cases is the **cash timing mismatch**: MSME cash is trapped in long receivable cycles while payroll and statutory obligations run on short cycles. You cannot solve the liquidity problem without also solving the compliance problem, because liquidity events (payroll runs, invoice settlements) are the same events that trigger compliance obligations (statutory deductions, BIR EIS reporting).

**They share the same customer.** Any formalized B2B MSME with employees experiences both problems simultaneously. A software agency founder who tokenizes a receivable to fund payroll also needs that payroll to trigger correct SSS/PhilHealth/Pag-IBIG deductions and needs the original invoice settled via the Stellar oracle to generate a compliant BIR EIS payload. These are not separate use cases for separate customers — they are sequential steps in a single workflow for the same person.

**The merged architecture is greater than the sum of its parts.** When liquidity (atomic swaps) and compliance (EIS + statutory routing) share the same on-chain event as their trigger, the BIR reference ID can be written back to the same Stellar transaction memo that records the swap. The liquidity provider's repayment triggers the EIS settlement event. Payroll runs are both the output of liquidity (you funded payroll with receivables) and the input to compliance (each payroll run splits statutory deductions). The integration is not additive — it is multiplicative.

**The December 2026 deadline is non-negotiable.** Candidate 3 has a hard external deadline. Every Philippine MSME must comply with BIR EIS by December 31, 2026. This creates urgency that pulls the market toward us without any marketing spend. Building the compliance bridge also means we are on the critical path for every formalized MSME in the country.

### What we deprioritized and why

**Candidate 2 (Digital Ad Tax / RMC 5-2024) was explicitly deprioritized for v1.**

This is a real problem and a good future product. But:
- It serves a narrower ICP (MSMEs running significant foreign platform ad spend)
- It requires a different technical posture (virtual corporate card issuing, NRFC merchant code detection)
- It requires a different compliance posture (the FWT remittance mechanism is distinct from EIS)
- It would fracture our go-to-market — agencies struggling with ad tax and agencies struggling with payroll timing are different pain profiles, and trying to serve both simultaneously dilutes the wedge

Candidate 2 is documented as a future vertical expansion once the core liquidity + compliance infrastructure is proven. Its technical architecture (programmable treasury, Soroban-based tax splitting) reuses our Soroban and oracle infrastructure, making it a natural Phase 4 product.

### The resulting product thesis

Liquidity and compliance are a single infrastructure problem for Philippine MSMEs. A tool that solves only one half is incomplete and will fail to retain users who discover they still have the other half unsolved. **Axial is the engine that handles both — on a single Stellar/Soroban pipeline — so founders never have to think about either again.**

---

## 5. The Name: Axial

**Axial** — *forming or belonging to a central axis.*

Liquidity flows in. Compliance flows out. Both rotate around the business at the center — keeping it balanced, keeping it moving forward. The founder sits at the axis: they do not chase either; both happen around them.

The name was not chosen for aesthetics first. It was chosen because it precisely describes the architecture: Axial is the central pivot where two previously siloed systems (receivable finance and regulatory compliance) become a single, rotating machine that the business runs on.

The axis metaphor also captures what the product does to the founder's experience. Without Axial, the founder is the connector between two chaotic systems — manually threading liquidity into compliance, manually threading compliance data back into accounting. With Axial, the founder steps out of the execution trench. The axis holds everything together so they can think at the level of the business, not its paperwork.

---

## 6. Brand Identity

### 6.1 Archetype: The Architect

Axial does not present itself as a disruptor. Disruption implies chaos, speed-and-break, burning-things-down energy. That is the opposite of what a founder needs when their payroll is three days away and their receivables are 57 days out.

Axial is **The Architect**: meticulous, organized, structural. It builds autonomous systems. It creates hidden infrastructure that allows the visible structure (the MSME) to stand and grow without collapsing under administrative weight. The architect does not micromanage individual tasks — they design the system that handles those tasks without needing attention.

**What this archetype rejects:**
- Alarmist UI language ("URGENT: Action Required")
- Feature sprawl (solving everything for everyone)
- Opacity (hiding what the system is doing and why)
- Anxiety as a business model (fear-selling compliance)

### 6.2 Mission

To engineer autonomous financial and regulatory systems that absorb the friction of business operations, allowing founders to step out of the execution trench and focus on high-level strategy.

**The paradigm shift:** Regulatory compliance (BIR EIS payloads, statutory deductions) stops being a high-stress, manual chore and becomes a low-friction, self-executing background process — with a human approving each filing in one click until full automation is BIR-certified. Liquidity stops being a crisis that interrupts operations and becomes a designed system the business relies on without noticing.

### 6.3 Visual Identity

**Design language:** Minimalist and modern. No data soup, no overwhelming grid density. Expansive white space (dark space in dark mode), clear typography, strict hierarchy.

**Materiality:** Glassmorphism — frosted-glass cards layered over deep-toned gradients. Represents the transparency of blockchain: visible yet secure. Institutional but not cold.

**Color palette:**
- *Primary canvas:* Obsidian `#0F172A` / Deep Slate `#1E293B` — grounded, professional, secure, low eye strain for long sessions
- *Action accent:* Bioluminescent Teal `#2DD4BF` — reserved exclusively for active states, successful transactions, living data (atomic swaps, synced compliance)
- *Metadata:* Soft Silver `#E2E8F0` — high-contrast but gentle; technical details without competing with primary actions
- *Mode:* Dark-mode optimized first; light mode if needed is secondary

**Typography:** Geist — bridges monospaced aesthetic and professional sans-serif, ideal for financial data and blockchain interfaces. Generous line heights. Condensed tracking in headlines. Metadata uses `label-sm` with increased letter spacing — meticulously organized documentation aesthetic.

**Elevation:** Achieved through glassmorphism and layered transparency rather than traditional shadows:
1. Base Layer: Obsidian canvas
2. Surface Layer: Deep Slate at 40–60% opacity with `backdrop-filter: blur(20px)`
3. Accent Layer: Subtle 1px Soft Silver borders at 10% opacity
4. Interaction Layer: Teal glows (`box-shadow: 0 0 15px rgba(45, 212, 191, 0.3)`) for active states and validations

### 6.4 Brand Voice and Tone

**Calm and assured.** Never alarmist. The system handles urgency; the copy does not perform urgency.
- ❌ "URGENT: Payroll Overdue"
- ✅ "Payroll liquidity secured and routed."

**Precise.** When dealing with Philippine tax logic and immutable ledgers, language is exact. No hedging, no vagueness about what happened.

**Empowering.** The copy assumes the user is a visionary architect, not a bookkeeper. It speaks to growth, systemization, and structural integrity. The user is always the sovereign — Axial executes on their behalf.

**Silent success.** Compliance events that succeed are acknowledged with ambient indicators — a soft glow, a quiet checkmark. No push notification. No modal. The system worked. That is expected. Moving on.

### 6.5 Core Messaging Pillars

1. **"Instant Capital, Effortless Compliance."** — The primary tagline (updated 2026-06-18). "Instant" means now, not 60 days from now. "Effortless" means Axial does the heavy lifting — mapping, JWS signing, statutory scheduling — so compliance collapses to a one-click *review and approve*, not a manual chore and not a silent robot filing on your behalf. *(The earlier "Invisible Compliance" is retired as the headline claim and kept only as the north-star vision of full automation once BIR-certified — see the PBW review block near the top of this doc.)*
2. **"Engineered for Autonomy."** — The system runs without being managed. The founder should not need to remember deadlines or check portals.
3. **"Your Ledger, Synchronized."** — The Stellar ledger and the BIR/government systems and the MSME's accounting view are always in agreement. No reconciliation anxiety.

---

## 7. Product Vision: The Unified Workflow

Axial operates as a seamless, automated pipeline. The founder's experience is a sequence of **decisions** (fund payroll? approve this batch?), not a sequence of tasks (calculate deductions, sign into SSS portal, upload JSON to BIR, check if it went through).

### 7.1 The Core Workflow

**Step 0 — Payer Onboarding & Invoice Confirmation (the closed-loop gate)**
Before any receivable is fundable, the B2B payer (the enterprise client who owes the money) is onboarded and KYB'd into Axial. The MSME raises an invoice; the payer confirms it inside Axial — "yes, we owe this ₱X, due this date." A **Notice of Assignment** is generated and the payer e-acknowledges that this receivable is assigned to Axial and is payable only to a designated collection address. **No payer confirmation and acknowledged NoA → no tokenization, no funding.** This single gate removes the fake-invoice and payment-redirection failure modes before they can exist.

**Step 1 — Tokenized Invoicing (Soroban SAC)**
With a confirmed, assignment-acknowledged receivable, the platform uses Stellar Asset Contracts (SAC) to mint a token representing the legal right to that receivable. Resource-efficient; minimal network fees.

**Step 2 — Instant Liquidity via Atomic Swap (with recourse + reserve)**
Institutional lenders or liquidity pools evaluate the confirmed receivable and the MSME's on-chain history. The Soroban contract funds the invoice at a calculated discount and executes an `atomic_swap`, instantly delivering **USDC on Stellar** to the MSME — but the advance is **~80–90% of face value, not 97%**: a holdback reserve is retained and the MSME carries contractual recourse + personal guarantee. The MSME's UI displays proceeds in PHP via FX conversion at the edge. The 60-day wait is bypassed; the funder is protected by structure.

**Step 3 — Programmable Statutory Payroll Splitting**
As the MSME routes the settlement asset for bi-weekly payroll, a Soroban smart contract replaces manual spreadsheets. It automatically calculates and routes the exact statutory deductions (SSS, PhilHealth, Pag-IBIG — employee and employer shares) to the respective government agency wallets in real-time. Contracts are denomination-agnostic — they take the asset address as a parameter, so any future Stellar-native PHP-pegged asset slots in without changing routing logic.

**Step 4 — BIR EIS Bridging (Compliance Co-Pilot — human in the loop)**
The moment the financial transaction achieves Stellar ledger consensus (3–5 seconds), an off-chain oracle service pulls the metadata and maps it to the 20 mandatory BIR EIS fields, producing a JWS-signable payload. Rather than transmitting silently, Axial **surfaces the prepared filing for human review and explicit approval**; on approval it submits within the T+3 window and writes the reference ID back to the Stellar transaction memo as immutable, auditable proof. Submission is mock today; live transmission is gated on BIR software certification + Permit to Transmit. Full auto-submission (no human step) is a post-certification roadmap option, never the default. The human checkpoint is the control that catches OCR/mapping errors and fraudulent invoices *before* they reach the government — which is precisely why "invisible" became "effortless." (Locked 2026-06-18 — see the PBW review block at the top of this doc.)

**Step 5 — Closed-Loop Settlement and Reconciliation**
On Day 60, the confirmed payer settles to the **designated lockbox / collection address** named in the NoA — the only payment instruction it ever received. The settlement contract repays the liquidity provider (principal + discount), releases the holdback reserve, and returns the residual margin to the MSME. A reconciliation worker watches every active invoice: if a due invoice has no funds in the lockbox by T+X, the MSME account is auto-frozen, the funder is notified, and recourse + blacklist are triggered. Because the payer acknowledged the NoA, paying the MSME directly does **not** discharge the debt — leakage is the payer's/MSME's liability, never the funder's loss.

### 7.4 How Axial Makes Money

Two revenue engines. The first scales with volume; the second is the recurring, sticky one.

**1. Liquidity spread (transaction).** Discount fee ≈ **2–3.5% of face value per ~30-day tenor** (so ~6–9% all-in on a Net-90 invoice). Most of that is funder yield for risk capital; **Axial keeps a platform spread of ~0.5–1.5% of face value per funded invoice** (rule of thumb: ≈ 1% of every funded peso), plus a thin PHP↔USDC FX spread at the edge and a small flat origination fee on sub-₱50k tickets so micro-invoices stay economic. Hard ceiling: total all-in cost must stay below traditional PH factoring (1–5%, often 15–30% APR, collateral-required) — undercutting that is the wedge.

**2. Compliance subscription (recurring — the moat).** "Effortless Compliance" is **not** free bait. The BIR EIS Dec-2026 mandate makes the EIS oracle + statutory payroll engine a must-have. Tiered monthly subscription by invoice volume / headcount monetizes MSMEs who are not factoring this month but must still file — smoothing revenue and raising switching cost.

### 7.2 What Success Looks Like for the Founder

- Payroll is funded on time, every time, even when receivables are at Day 45 of a Net 60 cycle
- SSS, PhilHealth, and Pag-IBIG contributions are correct, computed, and routed without spreadsheets or manual portal submissions
- BIR EIS payloads are generated and accepted within T+3 automatically — success reference visible in the UI, written to the chain memo
- The Overview tab shows a quiet "all green" state — no alarms, no fire drills — confirming the system is running
- The founder has not opened the BIR portal, the SSS contribution calculator, or a payroll spreadsheet this month

### 7.3 UI Philosophy: The Unrushed Digital Experience

Despite operating on high-frequency Stellar consensus protocols and strict T+3 reporting deadlines, the user must **never feel rushed**. Axial absorbs the urgency natively. The interface communicates in the language of a calm, competent system — not an anxious one.

**Four primary tabs** — no more, no less:

| Tab | Purpose |
|---|---|
| **Liquidity** | Tokenized AR, atomic swaps, settlement proceeds (USDC on Stellar, PHP-denominated UI), repayment timeline, lender context |
| **Compliance** | Statutory payroll splits, SSS/PhilHealth/Pag-IBIG routing, BIR EIS pipeline, T+3 queue, JWS submission status |
| **Overview** | Cross-domain health: liquidity headroom, upcoming payroll, filing windows, ambient success indicators |
| **Settings** | Org profile, connected wallets, notification preferences, network status, integrations |

Three tabs would force bias (Overview becomes either Liquidity or Compliance's home). Five tabs would fragment statutory workflows that are emotionally one problem for the user. Four is the minimum viable architecture.

---

## 8. Target Market

### 8.1 Primary ICP — B2B Tech, Creative, and Specialized Manpower Agencies

**Who:** 10–50 employee agencies (software, creative, specialized staffing). Project-based or milestone billing against enterprise clients enforcing Net 60–90 terms.

**Why they are the wedge:**
- **Digitally native.** They will immediately appreciate a minimalist glassmorphic UI and "unrushed" experience. The learning curve for Stellar/Soroban concepts is shorter with technical teams.
- **Acutely feel the pain.** Their primary cost is human talent — developers, designers, project managers — who cannot wait 60 days. The liquidity + payroll timing squeeze is experienced personally by the founder, not delegated to accounting.
- **Highly networked.** Philippine agency founders operate in dense professional networks (third-wave coffee shops, tech community events, founder circles). One satisfied reference account generates multiple warm introductions.
- **Short sales cycle.** They grasp API bridges and automated logic. They do not need blockchain education to understand the value proposition.

**What they need to see to convert:** Proof of an end-to-end flow — capital in, payroll out, BIR/EIS status visible — with pilot-friendly, white-glove onboarding.

### 8.2 Secondary ICP — Institutional F&B Suppliers and B2B Distributors

**Who:** Medium enterprises scaling production. Bulk volume sales, recurring institutional purchase orders to supermarket chains, hotel groups, or restaurant franchises holding payments 90–120 days.

**Why they come second:**
- Longer operational validation path — physical supply chain complexity requires the core infrastructure to be proven in service environments first
- Invoice volumes are higher and predictable, providing better yields for liquidity providers
- Their payroll mix (regular + contractual labor) makes the statutory engine more complex

**Why they matter:** Winning F&B suppliers integrates Axial into the lifeblood of local commerce. Proves the system can handle high-frequency, high-volume physical goods distribution. Unlocks the next scale tier for both liquidity volume and EIS submission throughput.

### 8.3 GTM Phasing

| Phase | Entry Criteria | Goal |
|---|---|---|
| **Phase 1 — Wedge** | Pilot-capable on Stellar Mainnet | Onboard software/creative agencies; maximize UX and reliability feedback |
| **Phase 2 — Validation** | No P0 reliability gaps on core bridge; Phase 1 milestones met | Prove atomic swaps, oracle/EIS, and statutory flows in real operations; activate founder referrals |
| **Phase 3 — Expansion** | Stable Phase 2 metrics | F&B suppliers and distributors; larger invoice throughput for liquidity side |
| **Phase 4 — Ad Tax Module** | Core infrastructure stable | Launch Candidate 2 (programmable treasury for RMC 5-2024) as a vertical add-on |

---

## 9. Regulatory and Ecosystem Context

Understanding this context is necessary for anyone working on Axial. These are not background facts — they are the forces that define urgency and constrain design.

### 9.1 BIR EIS (Electronic Invoicing System)

- Mandated under TRAIN Act + Ease of Paying Taxes Act (RA 11976)
- Revenue Regulation No. 026-2025 extended Phase 1 compliance deadline to **December 31, 2026**
- Applies to: large taxpayers, e-commerce entities, businesses using computerized accounting systems (CAS)
- Requirements: JSON/XML with 20+ mandatory fields, JWS-signed, transmitted via BIR EIS API within T+3
- Businesses need a **Permit to Transmit (PTT)** from BIR, certified systems, immutable storage formats
- Failure: severe tax penalties + exclusion from B2B supply chains where corporate buyers require EIS-compliant invoices

### 9.2 Statutory Payroll (SSS, PhilHealth, Pag-IBIG)

- Triggered the moment an MSME hires regular employees
- Three separate government portals, distinct calculation schedules, legislative updates that change brackets
- Under-remittance triggers penalties retroactively
- Manual spreadsheet management breaks when contribution rates change (as SSS recently demonstrated)

### 9.3 Stellar Ecosystem in the Philippines

- **PHP-pegged stablecoin (current state):** No production Stellar-native PHP stablecoin exists. PHPC (Coins.ph) is issued on Polygon and Ronin Network and exited the BSP regulatory sandbox on July 5, 2025. PHPX (UnionBank consortium) is on Hedera. Axial settles on Stellar in **USDC** and denominates UX in PHP via FX conversion at the edge.
- **QRPh:** National QR payment standard (~600,000+ merchant acceptance points), governed by PPMI under BSP. Access requires being a BSP-licensed PSP/EMI — not directly addressable by Stellar contracts or third-party SDKs. Handled at the partner edge (PDAX, Coins.ph, Maya, GCash, PayMongo for merchant flows).
- **PDAX:** BSP-licensed Virtual Asset Service Provider; main partner of the Build on Stellar Philippines 2026 hackathon; offers PDAX Connect API and CAAS platform that lets partners inherit PDAX's regulatory wrapper for PHP-to-digital-asset flows. Already has Stellar precedent via the 2022 Velo Labs partnership.
- **Coins.ph anchor:** Existing Stellar anchor (since 2017) for PHP remittances; usable as a secondary SEP-24 driver post-hackathon.
- **USDC on Stellar:** Issued by Circle, the production settlement asset Axial uses on Mainnet (issuer `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`).
- **Soroban:** Stellar's Rust-based smart contract platform (Protocol 20 mainnet Feb 2024); enables the `atomic_swap` and statutory routing logic.
- **Bitwave:** Enterprise on-chain accounting bridge for GAAP/IFRS reporting — relevant for Phase 4 and enterprise expansion.

### 9.4 The Continuous Transaction Control (CTC) Trajectory

The Philippine government is shifting from retrospective tax auditing to real-time Continuous Transaction Control. The EIS is the first stage. The direction of travel is toward real-time, government-visible transaction reporting across all taxable business activity. Axial's architecture — chain settlement as the compliance trigger — is directionally aligned with where the regulatory environment is going, not just where it is today.

---

## 10. What Axial Is Not

Explicit boundaries are as important as the vision. These are things we actively decided not to build.

| Out of Scope | Why |
|---|---|
| Full HR / recruitment / time-clock product | Different problem. Axial is liquidity + compliance infrastructure, not workforce management. |
| General ledger / ERP replacement | Axial bridges to accounting tools; it does not replace them. Competing with QuickBooks is not the mission. |
| Non-Philippine regulatory packages (v1) | Philippines-first is a constraint and a feature. Getting Philippine tax logic exactly right is harder than it looks; doing it for multiple jurisdictions simultaneously dilutes focus. |
| Discretionary AI tax advice | Compliance is deterministic, not advisory. Axial executes correct regulatory logic; it does not give legal opinions. |
| Banking license / fiat custody | Axial operates on the stablecoin + Stellar rail. It is not a bank. |
| Digital ad tax module (v1) | Candidate 2 is real and important — it is Phase 4, not launch scope. |
| Public blockchain explorer as sole reconciliation | Axial always presents human-readable settlement and compliance status alongside on-chain references. |

---

## 11. Open Decisions and Living Questions

These are things we have decided at a high level but where the implementation detail is not yet locked. They belong here so they are visible and do not get answered inconsistently across documents. Items resolved in the May 14 review are marked ✅; retired assumptions are marked ❌ with rationale so we do not relitigate them.

| Decision | Status | Current Posture | Notes |
|---|---|---|---|
| Settlement asset | ✅ Resolved | **USDC on Stellar** | Real, on Mainnet. UI denominates in PHP via FX conversion at the edge. **Not** dependency-free: Circle counterparty + freeze/blacklist risk and PHP/USDC FX risk are acknowledged as managed risks (PBW review 2026-06-18; see [`rfc-axial-risk-mitigation.md`](rfc-axial-risk-mitigation.md) O4/C5). |
| Compliance submission model | ✅ Locked | **Human-in-the-loop "Compliance Co-Pilot" — prepare → review → submit** | Locked 2026-06-18 (PBW review). Auto-submission gated on Permit to Transmit. See top-of-doc PBW block + [`rfc-axial-risk-mitigation.md`](rfc-axial-risk-mitigation.md) R1–R2. |
| PHP stablecoin = PHPC on Stellar | ❌ Retired | Not pursued | PHPC is on Polygon and Ronin, not Stellar. Exited BSP sandbox July 2025. Bridging is out of scope for v1. |
| PHP fiat rail (production) | ✅ Resolved | **PDAX as primary anchor** via PDAX Connect API; SEP-24 abstraction allows Coins.ph or future PHP-Stellar issuers to plug in without changing contract logic | PDAX sandbox access **not granted (2026-05-22)** — L3 dropped; hackathon ships L2 mocked PDAX UI. SEP-24 abstraction lets PDAX wire in post-hackathon with no contract changes. |
| Direct QRPh integration | ❌ Retired | Not buildable as third-party | QRPh requires BSP-licensed PSP/EMI status. Handled at the anchor edge. |
| FX rate source (PHP/USDC) | 🟡 Open | Reflector preferred, hardcoded acceptable for hackathon | See [Q4 in FOR DEVS § Open questions](#open-questions-for-the-dev-team) |
| Liquidity provider sourcing | 🟡 Open | Institutional lenders or pools, accessible via PDAX's 20+ LP network | Partner agreements TBD; affects discount rate structure |
| Settlement model | ✅ Locked | **Closed-loop, confirmed-invoice financing** — payer onboarded + invoice confirmed + NoA acknowledged before funding; lockbox collection; recourse + reserve; reconciliation auto-escalation | Locked 2026-05-19. Detailed in [`rfc-axial-closed-loop-settlement.md`](docs/rfc-axial-closed-loop-settlement.md). NoA text requires PH counsel — tracked in [`clr-axial.md`](docs/clr-axial.md) |
| API gateway style | 🟡 Open | REST + OpenAPI leans recommended for BIR API parity; tRPC if TS-monorepo cohesion wins | See [Q2 in FOR DEVS § Open questions](#open-questions-for-the-dev-team) |
| Auth mechanism | 🟡 Open | OIDC + org invites (preferred) | Vendor and session management TBD |
| Job queue tech | 🟡 Open | BullMQ vs Temporal | See [Q1 in FOR DEVS § Open questions](#open-questions-for-the-dev-team) |
| BIR EIS API access (production) | 🟡 Open | Awaiting PTT certification path | BIR staging environment availability TBD. Hackathon uses mock endpoint. |
| Statutory tables | 🟡 Open | Encoded as versioned rule packs (not hard-coded in Soroban) | Legal/accounting sign-off on bracket accuracy required before production |
| Wallet management (demo) | ✅ Locked | **Custodial backend signing** — the Next.js server holds funder/MSME/issuer secrets and signs all Soroban transactions | Locked 2026-05-22 (Build audit). Freighter self-custody is post-hackathon — tracked in [`sprint.md`](sprint.md) |
| Hosting region | 🟡 Open | Cloud, Asia-Pacific (Singapore/Manila latency) | See [Q8 in FOR DEVS § Open questions](#open-questions-for-the-dev-team) |
| Pricing model | ✅ Locked | **Two engines:** liquidity spread (~0.5–1.5% of face value platform cut, ≈1% of every funded peso) + tiered compliance subscription. All-in factoring cost capped below traditional PH factoring | Locked 2026-05-19. Detailed in §7.4 and `brd-axial.md`. Funder-yield split depends on liquidity partner agreements |

---

## 12. Document Map

All formal documents derive from this foundation. When this foundation is updated, the corresponding documents should be updated to stay consistent.

| Document | File | What it adds |
|---|---|---|
| **Axial.md** *(this file)* | `Axial.md` | Origin, thinking, identity — the "why" and "who we are" |
| **BRD** | `docs/brd-axial.md` | Formal business justification, success metrics, stakeholders |
| **PRD** | `docs/prd-axial.md` | Feature specs, user stories, acceptance criteria, UX intent |
| **DSD** | `docs/dsd-axial.md` | Design system — tokens, components, a11y, motion |
| **SDD** | `docs/sdd-axial.md` | System architecture, data model, API design, security |
| **GTM** | `docs/gtm-axial.md` | Launch strategy, channels, phasing, success metrics |
| **RFC** | `docs/rfc-axial-*.md` | Per-feature deep dives (closed-loop settlement, Soroban contracts, EIS oracle, etc.) |
| **CLR** | `docs/clr-axial.md` | Compliance & legal readiness register — PH Data Privacy Act, KYC/KYB, NoA legal mechanism, launch gate |

---

## 13. Hackathon Submission

This section is the canonical submission record for the **Build on Stellar Philippines Hackathon 2026** (May 18–24, 2026). All fields below mirror the official submission form; the rest of this document is the depth behind each answer.

### 13.1 Project Name

**Axial**

### 13.2 Problem Statement

Philippine B2B MSMEs face a single structural failure that surfaces as two problems at once:

- **Liquidity trap.** Enterprise buyers enforce Net 60–90 payment terms while Philippine labor law mandates bi-weekly payroll. A growing, profitable agency can run out of cash 14 days at a time because its revenue is locked in receivables. Visa places the formal MSME funding demand in the Philippines at $221B against a supply of $15B — one of the largest funding gaps in the Asia-Pacific.
- **Compliance burden.** The BIR Electronic Invoicing System mandate (Revenue Regulations 11-2025 and 26-2025, deadline December 31, 2026) requires structured JSON invoice transmission with JWS signing within T+3 of every transaction. The mandate currently binds Phase 1 taxpayers — Large Taxpayers Service registrants, e-commerce, exporters, ₱1B+ gross sales, CAS/CBA users — with subsequent phases on the BIR roadmap. Meanwhile, statutory payroll (SSS, PhilHealth, Pag-IBIG) remains manual for the 56% of MSMEs on spreadsheets, with retroactive penalties when contribution brackets change.

Existing accounting tools record the absence of cash; they do not generate it. They record a tax liability; they do not execute the payment. The market needs financial infrastructure, not another data repository.

### 13.3 Proposed Solution

Axial is a Stellar/Soroban-powered **liquidity and compliance engine** that turns the two problems above into a single automated pipeline:

1. The B2B payer is onboarded, confirms the invoice, and e-acknowledges a Notice of Assignment — only then is the receivable tokenized as a Stellar Asset on Soroban.
2. A Soroban contract executes an atomic swap: the receivable token to the liquidity provider, USDC to the MSME — instantly, without physical collateral, advancing ~80–90% with a holdback reserve and MSME recourse.
3. When the MSME runs payroll, a Soroban contract splits the gross amount into employee net pay, employer share, and the three statutory routes (SSS, PhilHealth, Pag-IBIG) — calculated against versioned, legally-reviewed bracket tables.
4. Every reportable ledger event triggers an off-chain compliance oracle that maps Stellar transaction metadata to the BIR EIS 20-field schema and JWS-signs the payload, then presents it for **human review and approval** before submission within T+3 (mock endpoint today; live transmission gated on BIR certification + Permit to Transmit). The reference is written back to the Stellar memo as immutable proof.
5. The confirmed payer settles to the designated lockbox; the contract repays the liquidity provider, releases the reserve, and returns the margin to the MSME. Reconciliation auto-escalates any leakage — and because the NoA was acknowledged, off-system payment does not discharge the debt.

The brand promise is **"Instant Capital, Effortless Compliance."** Both halves run on the same on-chain event, which is what makes the integration architecturally inseparable rather than two products glued together.

### 13.4 Target Users / Audience

**Primary (Phase 1 wedge):** Philippine B2B service MSMEs — software, creative, and specialized manpower agencies, 10–50 employees, project or milestone billing against enterprise buyers with Net 60–90 terms. Digitally native, networked, short sales cycle, personally feeling the payroll-vs-receivables timing squeeze.

**Secondary (Phase 3):** Institutional F&B suppliers and B2B distributors selling into supermarket chains, hotel groups, and restaurant franchises holding payments 90–120 days. Higher invoice volume, more complex payroll mix, longer operational validation path.

**Out of scope for v1:** Sole proprietors below the BIR Phase 1 threshold, retail consumer apps, non-Philippine jurisdictions, full HR/ERP replacement.

### 13.5 Selected Focus Track

- [x] **MSME Commerce** *(primary — matches the hackathon's stated focus area; Axial is invoicing, payroll, and cashflow infrastructure for small businesses)*
- [x] **Stablecoins & PayFi** *(secondary — Axial's tokenized-receivable-to-instant-settlement flow is PayFi as Stellar defines it)*
- [ ] Payments & Remittances
- [ ] Financial Inclusion
- [ ] Developer Tools

### 13.6 Team Members & Roles

| Member | Role |
|---|---|
| **Carlos Jerico Dela Torre** | Business and Product Developer · Team Lead |
| **Aidan Tiu** | DevOps Engineer |
| **Gerald Berongoy** | Full Stack Engineer |
| **Rhandie Sales Jr.** | Full Stack Engineer |

### 13.7 Initial Technical Approach

**Stack (per [SDD](docs/sdd-axial.md)):**

- **Client:** Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · Geist · Material Symbols. Four-tab IA: Liquidity, Compliance, Overview, Settings.
- **Application tier:** modular monolith. API gateway + domain services + job workers (BullMQ or Temporal — TBD). REST + OpenAPI preferred over tRPC for BIR API parity and external integration legibility.
- **Smart contracts:** Soroban (Rust → WASM) for SAC issuance, atomic swap, statutory payroll router, settlement.
- **Compliance oracle (Co-Pilot):** off-chain service in the application tier — subscribes to Stellar ledger events, maps to the BIR EIS 20-field schema, JWS-signs in a vault-mediated key context, surfaces the prepared filing for human review/approval, then submits to BIR with idempotency keys on approval, writing the acknowledgement memo back on-chain.
- **Data:** PostgreSQL (authoritative for UX projections and submission state) · Redis (distributed locks, rate limits) · Vault/KMS (BIR signing keys, wallet material — never in env files).
- **Hosting target:** Asia Pacific region for BIR API latency and connectivity path.

**Hackathon scope (7 days, May 18–24):**

- **M0 (Day 1):** Repo, envs, Soroban skeleton, no secrets in repo, four-tab UX shell wired.
- **M1 (Day 5):** End-to-end testnet demo path — mock verified receivable → SAC mint → atomic swap into demo PHP-pegged Stellar Asset → payroll contract executes statutory split → oracle emits mock BIR EIS payload (JWS-signed against a sandbox key) → success reference written to Stellar memo → Overview tab shows the full chain visibly green.
- **Day 6–7:** Polish, demo recording, security pass on what reaches mainnet, deploy demo contracts to Stellar Mainnet for judging-criteria compliance.

**Production readiness work that is explicitly post-hackathon:** BIR PTT certification, legal sign-off on statutory tables, liquidity provider partnership agreements, BSP/CASP regulatory posture, real PHP stablecoin selection (see §13.8).

### 13.8 Expected Stellar Integration

**Locked architecture (May 14):** Settlement on Stellar Mainnet uses **USDC** (issued by Circle, account `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`). The UI denominates everything in PHP; FX conversion happens at the edges. The PHP fiat rail is **PDAX as production target**, with a SEP-24 anchor abstraction so other anchors (Coins.ph, future Stellar-native PHP issuers) plug in without changing contract logic. PHPC was considered and not pursued — see §11.

**Stellar primitives used:**

- **Stellar Asset Contracts (SAC):** Each verified receivable is minted as a SAC with invoice metadata referenced via contract storage. The SAC is the on-chain representation of the legal right to payment.
- **Soroban smart contracts (denomination-agnostic):** Atomic swap contract takes the asset address as a parameter — USDC for the hackathon demo, any other Stellar asset post-hackathon. Statutory payroll router encodes SSS/PhilHealth/Pag-IBIG brackets as versioned rule packs. Settlement contract routes buyer payment to liquidity provider and margin to MSME.
- **Stellar transaction memos:** BIR EIS success reference IDs written back as memo data, anchoring off-chain compliance proof to on-chain finality.
- **Horizon / Stellar RPC:** Oracle service subscribes to events on the org's account and contract addresses; circuit breaker + provider failover; never blocks a user-facing request on chain confirmation.
- **`AUTH_REQUIRED` / `AUTH_REVOCABLE` flags on Stellar-issued assets:** Statutory routing contracts use authorization flags to enforce that statutory tokens flow only to whitelisted government agency addresses.
- **SEP-24 Hosted Deposit and Withdrawal:** The standard interface for PHP fiat on/off-ramp. PDAX is one driver behind this interface for production; the hackathon demo uses mocked UI behind the same interface so the swap to a real anchor is a configuration change, not a refactor.
- **Reflector (preferred) or hardcoded reference rate:** Price oracle for PHP/USDC conversion at swap time. See [Q4 in FOR DEVS § Open questions](#open-questions-for-the-dev-team).
- **Stellar Testnet** for development and integration testing throughout the build; **Stellar Mainnet** deploy of contracts on Day 5 to satisfy the judging criterion that the project be deployed on Mainnet.

**FX and denomination model.** Invoices, payroll previews, and compliance dashboards all show PHP amounts (e.g. ₱500,000). Internally, every Soroban operation transacts in USDC. The conversion is one read against the price oracle at swap time, written to the contract's event log so the rate used is auditable. This mirrors how Stripe Connect, Wise, and dLocal operate — local-denominated UX, stable-denominated settlement. Production hardening (rate-lock windows, hedging) is post-hackathon work.

**Why USDC over a Stellar-native PHP stablecoin.** PHPC (Coins.ph) is issued on Polygon and Ronin Network, not Stellar, and exited the BSP regulatory sandbox in July 2025; bridging it adds third-party risk and is out of scope for v1. PHPX (UnionBank-led consortium) is on Hedera. No production-ready Stellar-native PHP stablecoin exists at submission time. A future Stellar-native PHP asset — issued by PDAX as a SEP-24-conformant anchor, or by another regulated PH partner — slots in as a swap of the asset parameter in the existing contracts and a new driver behind the SEP-24 interface. The architecture explicitly does not depend on this happening.

### 13.9 XLM Mainnet Wallet Address

```
GDSCTQZRRGF23F5GWNE3FYLLPEGO23BB3RQ6AYO5756C7A4HJLEXZVTQ
```
