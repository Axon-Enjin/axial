# Axial — App flow & feature scope (visual)

**Build:** Stellar Mainnet · May 2026  
**Legend:** `✅` built & wired · `🟡` UI/mock or partial · `⬜` planned (docs) · `❌` won't ship v1

**Aligned with:** `web/` app · `GET /api/dashboard/summary` · Supabase `ifzyntqwymmgimnxtguz`

---

## 1. Four tabs — what lives where

```mermaid
flowchart TB
  subgraph app [Axial Web App — Next.js 15]
    OV["/ Overview<br/>Command Center"]
    LQ["/liquidity<br/>Liquidity"]
    CP["/compliance<br/>Compliance"]
    ST["/settings<br/>Settings"]
  end

  OV --> OV1["✅ BIR EIS pulse — live API"]
  OV --> OV2["✅ Statutory pulse — chain status"]
  OV --> OV3["✅ Recent Actions — EIS feed"]
  OV --> OV4["✅ Liquidity headline — book from summary API"]
  OV --> OV5["🟡 Runway chart — demo bars + EIS activity hint"]
  OV --> OV6["✅ Treasury — Mainnet USDC/XLM balances"]

  LQ --> LQ1["✅ Upload PDF/XML — OCR parse + persist"]
  LQ --> LQ2["✅ Invoice table — Supabase/file + pagination"]
  LQ --> LQ3["✅ Payer portal — confirm + eligibility"]
  LQ --> LQ4["✅ Tokenize & Swap — Mainnet"]
  LQ --> LQ5["✅ Swap quote API — 85% advance"]
  LQ --> LQ6["✅ Pipeline progress — toast + sidebar"]
  LQ --> LQ7["✅ Stat tiles — treasury USDC + book + contracts"]

  CP --> CP1["✅ Payroll quote — contract math"]
  CP --> CP2["✅ Route Payroll — Mainnet*"]
  CP --> CP3["✅ BIR EIS table — Supabase"]
  CP --> CP4["✅ Expand 20 BIR fields"]
  CP --> CP5["🟡 Filing milestones — static"]

  ST --> ST1["🟡 Org / TIN forms — local UI"]
  ST --> ST2["🟡 Auto-route toggle — no backend"]
  ST --> ST3["✅ PDAX ramp — L2 demo card + toast"]

  style OV5 fill:#3d3520
  style CP5 fill:#3d3520
```

\* Payroll uses `lastSwapAdvancePhp` from context after swap (not full ₱1.25M demo gross).

---

## 2. Full product journey (vision — closed loop)

What Axial is **designed** to do per `Axial.md`, `prd-axial.md`, `rfc-axial-closed-loop-settlement.md`:

```mermaid
flowchart LR
  subgraph phaseA [A — Intake & trust]
    A1["✅ Upload invoice PDF/XML"]
    A2["✅ OCR + validate metadata — parse API"]
    A3["⬜ Payer KYB onboard"]
    A4["✅ Payer confirms invoice — portal"]
    A5["✅ Notice of Assignment — issue + e-ack API"]
  end

  subgraph phaseB [B — Liquidity — HACKATHON CORE]
    B1["✅ Mint receivable SAC"]
    B2["✅ Atomic USDC swap advance"]
    B3["🟡 PHP display / USDC settlement"]
  end

  subgraph phaseC [C — Use funds]
    C1["✅ Statutory payroll split"]
    C2["⬜ Pay suppliers / ops"]
  end

  subgraph phaseD [D — Effortless compliance: review and submit]
    D1["✅ Oracle → 20 BIR fields"]
    D2["✅ JWS mock sign"]
    D3["🟡 Human review → approve — Co-Pilot; mock may auto-ack"]
    D4["✅ Mock BIR accept"]
    D5["✅ Memo write-back Stellar"]
    D6["✅ Supabase audit log"]
  end

  subgraph phaseE [E — Collection]
    E1["🟡 Payer pays lockbox — Freighter USDC + mark_collected settle (S5)"]
    E2["✅ Settlement contract — deployed + settle wired"]
    E3["✅ Funder repaid + reserve release — book status"]
    E4["✅ Reconciliation cron — leakage scan"]
  end

  subgraph phaseF [F — Fiat edge — L2 only]
    F1["✅ PDAX mock UI — Settings"]
    F2["❌ Real PDAX API — no sandbox access"]
  end

  A1 --> A2 --> A3 --> A4 --> A5 --> B1 --> B2 --> C1
  B2 --> D1 --> D2 --> D3 --> D4 --> D5 --> D6
  C1 --> D1
  B2 --> E1 --> E2 --> E3 --> E4
  B2 -.-> F1
```

---

## 3. What happens today — demo path (Mainnet)

Use this for recordings and mental model:

```mermaid
sequenceDiagram
  actor MSME as MSME Founder
  participant UI as Axial UI
  participant API as Next.js API
  participant SC as Soroban Mainnet
  participant OR as EIS Oracle
  participant DB as Supabase
  participant BIR as Mock BIR

  opt Upload new invoice
    MSME->>UI: Liquidity → Upload PDF/XML
    UI->>API: POST /api/invoices/parse
    API->>DB: upsert factoring_invoices
    API-->>UI: row + toast pipeline
  end

  MSME->>UI: Confirm payer (demo)
  UI->>API: PATCH /api/invoices/:id confirm_payer
  API->>DB: status=fundable
  API-->>UI: row updated in place

  MSME->>UI: Tokenize & Swap
  UI->>API: POST /api/receivable/mint
  API->>SC: mint SAC
  SC-->>API: txHash
  API->>OR: triggerEis receivable_minted
  API-->>UI: success + toast

  UI->>API: POST /api/swap/execute
  API->>SC: execute_advance USDC
  SC-->>API: txHash
  API->>OR: triggerEis swap_executed
  API-->>UI: settled row + toast

  par Co-Pilot prepare async
    OR->>OR: map 20 BIR fields
    OR->>OR: JWS sign
    OR->>DB: upsert eis_submissions prepared
    Note over MSME,OR: Locked UX: human reviews before live BIR submit.<br/>Demo mock may still auto-ack until UI gate + PTT.
    OR->>BIR: mock acknowledge
    OR->>SC: memo payment + BIR ref
  end

  MSME->>UI: Compliance → review payload → approve
  UI->>API: GET /api/eis/submissions
  API->>DB: list rows
  API-->>UI: payload + BIR ref + memo link

  MSME->>UI: Route Payroll optional
  UI->>API: POST /api/payroll/route
  API->>SC: route_payroll
  API->>OR: triggerEis payroll_routed

  MSME->>UI: Overview
  UI->>API: GET /api/dashboard/summary
  API->>DB: book totals + EIS counts
  API->>SC: wallet USDC balances
  API-->>UI: ₱ face, treasury USDC, contracts live
```

---

## 4. Upload → fund path (built for demo)

```mermaid
flowchart TD
  U["MSME uploads PDF/XML"] --> P["✅ Parse: invoice #, buyer, amount, due"]
  P --> R["✅ Row in Liquidity table — Supabase or file fallback"]
  R --> PC["✅ Confirm payer — portal"]
  PC --> NOA["✅ NoA issued + acknowledged — API"]
  NOA --> OK["✅ Fundable — Tokenize & Swap enabled"]
  OK --> M["✅ Mint on Soroban"]
  M --> S["✅ Swap USDC"]
  S --> EIS["✅ EIS Co-Pilot prepare / enqueue"]
  EIS --> UI2["✅ Compliance review + Overview update"]
```

**Not built:** live vendor KYB; live BIR PTT submission. **S5 settle** shipped in code — verify on Mainnet via [`settle-dry-run-checklist.md`](settle-dry-run-checklist.md).

---

## 5. System architecture (runtime)

```mermaid
flowchart TB
  subgraph client [Browser]
    TABS["4 tabs: Overview · Liquidity · Compliance · Settings"]
  end

  subgraph next [web/ — Next.js API routes]
    D0["GET /api/dashboard/summary"]
    I1["GET/PATCH /api/invoices · POST parse/seed"]
    W1["GET /api/wallets/balances"]
    S1["GET /api/soroban/status"]
    S2["GET /api/swap/quote"]
    S3["POST /api/swap/execute"]
    S4["POST /api/receivable/mint"]
    S5["GET /api/payroll/quote"]
    S6["POST /api/payroll/route"]
    S7["GET /api/eis/submissions"]
    S8["POST /api/eis/process · seed"]
    S9["POST /api/bir/eis"]
  end

  subgraph libs [web/lib]
    CFG["soroban/config · balances"]
    INV["invoices/store · msme/invoice-trust"]
    CHAIN["invoke-receivable · swap · payroll"]
    EIS["eis/oracle · schema · jws · memo"]
    SB["supabase/eis-store · invoices-store"]
  end

  subgraph chain [Stellar Mainnet]
    RT["receivable_token"]
    AS["axial_swap"]
    PS["payroll_split"]
    USDC["Circle USDC"]
  end

  subgraph data [Persistence]
    PG[("Supabase eis_submissions + factoring_invoices")]
    FILE[("fallback JSON files")]
  end

  TABS --> next
  next --> libs
  CHAIN --> RT & AS & PS & USDC
  EIS --> PG
  INV --> PG
  INV -.-> FILE
  EIS --> chain
```

---

## 6. EIS oracle — compliance brain

```mermaid
stateDiagram-v2
  [*] --> queued: ledger event received
  queued --> submitted: upsert + JWS built
  submitted --> acknowledged: mock BIR OK
  acknowledged --> memo_written: Stellar memo tx
  acknowledged --> acknowledged: memo failed error stored
  submitted --> failed: BIR/sign error
  memo_written --> [*]: idempotent replay returns same
  failed --> [*]

  note right of queued
    Triggers: mint, swap, payroll API success
    Idempotency: org:txHash:referenceId
  end note
```

---

## 7. Feature scope matrix

| Feature | PRD priority | Hackathon L1 | Status |
|---------|--------------|--------------|--------|
| Payer portal + confirm invoice | Must | ✅ | `/app/payer-portal` token auth + `/api/payers` + eligibility |
| NoA e-acknowledgement | Must | ✅ | `/api/noa/[receivableId]` issue + ack |
| Payer KYB onboarding | Must | 🟡 | `AXIAL_KYB_MODE`; mock auto-verify or manual review in PayerPanel |
| Invoice upload + OCR | Implied UI | ✅ | Parse API + persist |
| Factoring book + pagination | Should | ✅ | Supabase `factoring_invoices` |
| SAC mint / receivable token | Must | ✅ | Mainnet |
| Atomic USDC swap | Must | ✅ | Mainnet |
| Payroll statutory split | Must | ✅ | Mainnet |
| BIR EIS oracle 20 fields | Must | ✅ | Mock BIR + real pipeline |
| JWS + memo write-back | Must | ✅ | Mock JWS |
| T+3 worker / due_by | SDD | ✅ | `eis/worker` cron — retry within window, expire after |
| Horizon event poll | SDD | ✅ | `eis/horizon-poll` cron every 10 min |
| Reconciliation / leakage scan | SDD | ✅ | `reconciliation/scan` cron, daily |
| FX rate (Reflector) | L2 | ✅ | `lib/fx/reflector.ts` + `/api/fx/rate`, hardcoded fallback |
| Supabase / audit log | Should | ✅ | `eis_submissions` + invoices |
| Auth / multi-tenant | Prod | ✅ | Supabase SSR auth, org-scoped, invites |
| Overview health dashboard | Must | ✅ | Live EIS + summary API + treasury |
| Liquidity stat tiles | Should | ✅ | Summary API |
| Closed-loop lockbox settlement | Must | ✅ | `settlement` on Mainnet; S3–S5 wired; S6 trust doc updated |
| PDAX PHP ramp UI | L2 | ✅ | Settings `PdaxRampCard` |
| Operating network | L1 | ✅ | Stellar Mainnet — all 4 contracts deployed + initialized; system runs Mainnet-only |
| Live BIR submission | — | ⬜ | Mock by default; `BIR_EIS_LIVE` gates real client |
| Funder Protection Center | Should | ✅ | Embedded in Liquidity + share link to `/app/funder-portal` |
| Funder portal (external LP) | Could | ✅ | Token or org-session preview · [`/app/funder-portal`](../../web/app/app/funder-portal/page.tsx) |
| Trust & Boundary screen | Should | ✅ | Settings ack gate before first tokenize |
| Payer dispute workflow | Should | ✅ | Payer portal + `/api/disputes` |
| Calm notifications | Should | ✅ | In-app notification center (no email/SMS) |
| Per-org EIS TIN | P1 | ✅ | Org tax profile in Settings |
| EIS monitor (stuck T+3) | P1 | ✅ | `/api/eis/monitor` |

---

## 8. Layer roadmap (L1 / L2 / L3)

```mermaid
flowchart LR
  subgraph L1 [L1 Must ship — judge demo]
    L1a["✅ 4 Soroban contracts on Mainnet"]
    L1b["✅ Swap + mint + payroll UI"]
    L1c["✅ EIS oracle + Compliance UI"]
    L1d["✅ Circle USDC settlement on Mainnet"]
    L1e["🟡 Fiat placeholder — treasury card"]
  end

  subgraph L2 [L2 Nice to have]
    L2a["✅ PDAX mock screens"]
    L2b["✅ Upload → table + OCR"]
    L2c["🟡 Payer/lockbox demo UX"]
  end

  subgraph L3 [L3 Dropped — no PDAX sandbox access]
    L3a["❌ PDAX Connect API — not pursued 2026-05-22"]
  end

  L1 --> L2 --> L3
```

---

## 9. One-page actor view

```mermaid
flowchart TB
  MSME["MSME Founder"]
  PAYER["B2B Payer — ✅ portal confirm + NoA"]
  FUNDER["Funder / Treasury — ✅ demo wallet USDC"]
  BIRG["BIR — mock endpoint"]
  STELLAR["Stellar / Soroban"]

  MSME -->|"✅ upload + parse"| AXIAL["Axial UI"]
  MSME -->|"✅ tokenize & swap"| AXIAL
  MSME -->|"✅ route payroll"| AXIAL
  MSME -->|"✅ view compliance"| AXIAL

  PAYER -->|"✅ portal confirm + NoA ack"| AXIAL
  PAYER -.->|"⬜ pay lockbox"| AXIAL

  AXIAL -->|"✅ contracts"| STELLAR
  AXIAL -->|"✅ EIS submit"| BIRG
  BIRG -->|"✅ ack ref"| AXIAL
  AXIAL -->|"✅ memo"| STELLAR

  FUNDER -->|"✅ USDC advance via swap"| STELLAR
```

---

## Quick reference — APIs

| Method | Path | Role |
|--------|------|------|
| GET | `/api/dashboard/summary` | Book totals, treasury USDC, EIS counts, contracts |
| GET | `/api/wallets/balances` | Per-wallet XLM + USDC (Overview treasury) |
| GET | `/api/invoices?page=&pageSize=` | Paginated factoring book |
| PATCH | `/api/invoices/[id]` | `confirm_payer`, `settle`, `mark_collected` |
| POST | `/api/invoices/parse` | OCR + upsert row |
| POST | `/api/invoices/seed?force=true` | Dev seed 12 rows |
| GET | `/api/soroban/status` | Chain + `eisStore` + contract IDs |
| GET | `/api/swap/quote?face=` | Advance math |
| POST | `/api/receivable/mint` | SAC mint |
| POST | `/api/swap/execute` | USDC advance |
| GET | `/api/payroll/quote?gross=` | SSS / PhilHealth / Pag-IBIG split |
| POST | `/api/payroll/route` | On-chain payroll |
| GET | `/api/eis/submissions` | Compliance + Overview |
| POST | `/api/eis/seed` | Dev demo rows |
| POST | `/api/eis/process` | Manual oracle replay |
| GET | `/api/eis/worker` | Cron — T+3 retry / expiry (every 6h) |
| GET | `/api/eis/horizon-poll` | Cron — chain event ingest (every 10 min) |
| GET | `/api/reconciliation/scan` | Cron — leakage scan (daily) |
| POST | `/api/bir/eis` | Mock BIR accept |
| GET | `/api/fx/rate` | PHP/USDC rate — Reflector oracle + fallback |
| GET/POST | `/api/payers` · `/api/payers/[id]` | Payer records |
| POST | `/api/noa/[receivableId]/issue` · `/ack` | Notice of Assignment |
| POST | `/api/auth/invite` · `/api/auth/members` | Org invites + membership |
| POST | `/api/tx/submit` | Submit a client-signed (Freighter) transaction |

Cron endpoints are protected by `CRON_SECRET`; run them as GCP Cloud Scheduler jobs.

---

*Update this doc when the settlement wiring (B-2 S3–S6) or live BIR submission lands.*

*Audit-derived task board: [`sprint.md`](sprint.md) · scope decisions: "Build audit & final scope lock (2026-05-22)" in [`Axial.md`](Axial.md).*
