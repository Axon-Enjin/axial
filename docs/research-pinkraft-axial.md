# Pink Raft → Axial: Philosophy, Mechanics, and Where to Iterate

> Deep-research report. Question: scrape the idea behind the Stellar project **Pink Raft**
> (https://pinkraft.xyz/) — its philosophy and how it works — and produce an actionable
> analysis of how **Axial** can adapt that framework, with benchmarks from comparable
> Stellar/Soroban DeFi, RWA, and invoice-factoring protocols.
>
> Method: fan-out web search → source fetch → 3-vote adversarial verification → synthesis.
> Confidence tags below (e.g. `3-0`, `2-1`) are verification vote margins. Refuted claims
> are flagged explicitly. The automated synthesis step was cut off by a session token
> limit; the confirmed findings were merged and ranked by hand.
>
> Date: 2026-07-15.

## 1. What Pink Raft actually is

Pink Raft is a **visual no-code contract composer for Soroban**. The whole product is one idea, executed cleanly:

> "Every pipeline is a directed graph of **trigger → logic → action**, compiled to a single Soroban contract." *(verified 2-1, pinkraft.xyz)*

Taglines: *"Drag. Drop. Deploy."* and *"Real money, real chain, ninety seconds end-to-end."*

Three block types — **Trigger** (USDC inflow / schedule / Soroban event), **Logic** (amount checks, routing gates), **Action** (split / stream / conditional payout) — snap together on a canvas and compile to **one** deployed contract. Non-custodial, USDC-native, and **testnet-first** (its headline counters — ~9,412 rafts, 1,284 pipelines, 1.2s deploy, ~0.0001 XLM gas — are testnet demo numbers).

**Honesty flag from verification:** the claim that Pink Raft's three templates are *"audited, production-ready"* was **refuted (0-2)**. The site presents templates and speed metrics; "audited" is not substantiated. Treat Pink Raft as a hackathon/demo-grade tool showing a *pattern*, not a battle-tested protocol.

### The transferable philosophy (the real payload)

1. **Composition over configuration.** Financial behavior = a small alphabet of blocks wired into a graph. Non-experts assemble; the system compiles.
2. **Speed-to-first-value as the whole pitch.** "90 seconds end-to-end." No signup wall between a visitor and the value prop.
3. **Live transparency counters as trust signals** — deployment count, latency, gas, active pipelines, all on the landing page.
4. **One graph → one contract.** Legibility: a user can point at the picture and know exactly what will execute.

## 2. Where Axial and Pink Raft diverge (and why it matters)

| Dimension | Pink Raft | Axial |
|---|---|---|
| Network posture | Testnet-first, demo metrics | **Mainnet-only, real USDC** |
| Signing | Non-custodial (user keys) | **Custodial backend signing** |
| Contracts | Generic (splitter/streamer/conditional) | Domain-specific (receivable/swap/payroll/settlement) |
| User | "Anyone" | PH MSME founders + funders + payers |
| Compliance | None | **BIR EIS + statutory payroll — the core moat** |

Axial is the harder, more real product. So **don't copy Pink Raft's substance — steal its legibility and speed.** Axial already has 4 deployed mainnet contracts and a working atomic swap; what Pink Raft does better is *making the mechanism visible and fast to grasp.*

## 3. Concrete adaptations for Axial

### A. Render Axial's flows as a trigger→logic→action graph (highest leverage, lowest cost)

Axial's pipelines already *are* this shape — you just don't show it:

- **Receivable advance:** Trigger `invoice confirmed` → Logic `eligibility + advance_bps 85%` → Action `atomic swap USDC↔receivable` → (side-effect) `EIS oracle fires`.
- **Payroll:** Trigger `payroll run` → Logic `statutory split rules` → Action `route SSS/PhilHealth/Pag-IBIG + net`.
- **Settlement:** Trigger `payer funds lockbox` → Logic `contract-balance pre-check` → Action `settle: advance→funder, remainder→MSME`.

Build this as a **read-only visual pipeline view** in `web/components/views/` — not an editor. It reuses existing state; it's a rendering layer over flows that already exist. This makes the **Effortless Compliance / Co-Pilot** claim *visible* (prepare → review → submit) without adding a single contract. *"Invisible Compliance"* remains the north-star only. *Skip the drag-drop editor; add when a user actually needs to author custom splits.*

### B. Adopt clear-signing / legible confirmations (verified best practice, 3-0)

The strongest verified finding for Axial: **ERC-7730 / clearsigning.org** — protocols publish JSON descriptors mapping raw contract calls to human-readable fields; wallets render comprehensible confirmation screens.

> "Wallets fetch relevant metadata at signing time and render comprehensible confirmation screens." *(clearsigning.org, 3-0)*

Even with **custodial signing**, Axial should render a plain-language "here's exactly what this transaction does" panel before every advance/payroll/settle — amounts in PHP, recipients named, compliance side-effects listed. Directly serves the "silent success" design principle and is the single most concrete UX upgrade the research surfaced.

### C. Put transparency counters on the landing/overview

Pink Raft's trust play. Axial's equivalents (real, mainnet): total receivables financed (₱), advances settled, EIS submissions acknowledged within T+3, statutory splits routed. `web/app/api/dashboard/summary` likely already computes most of these. Converts "compliance happening in the background" into a proof surface.

### D. Speed-to-value: kill friction to first "aha"

Pink Raft: no signup wall. Axial's analog is the **local file-fallback dev mode** (middleware no-op when Supabase env unset) — lean into a **guided demo/sandbox** path (`AXIAL_ALLOW_SEED`) that shows a founder unlocking cash from a sample invoice in under a minute, before any auth.

## 4. Benchmarks — where Axial can push further

### Huma Finance (strongest direct comp — receivables financing / "PayFi")

- **$2B+ processed in 2024 with zero credit defaults**, projecting $10B+ *(verified 3-0)*.
- Pricing model worth studying: **~6–10 bps *daily* fee, repaid in 1–5 days, capital recycles many times/year** → double-digit LP yields *(verified 2-1)*.
- Same thesis as Axial: "access receivables immediately rather than waiting for payment terms" *(3-0)*.
- **Benchmark takeaway:** Huma's economics come from *velocity* (short-duration, high-recycle capital), not high per-deal margin. Axial's Net 60–90 receivables are *long*-duration — so the funder-yield story is structurally weaker unless Axial either (a) pools/recycles capital or (b) prices the duration. Model this explicitly.

### Centrifuge (RWA tokenization scale)

- **$1.8B+ TVL, 1,768 assets tokenized** *(2-1)*; launched real RWAs *on Stellar* — deJTRSY (Janus Henderson treasuries) and deJAAA (AAA CLO) *(3-0)*. Institutional RWA is live on Axial's exact network.
- Tinlake model: **each invoice/asset → its own NFT** usable as collateral *(3-0)*. Axial's one-mint-per-invoice `receivable_token` already mirrors this — validation of the design.

### Onchain factoring (general)

- Invoices become **programmable tokens financeable by a global lender network, not one local bank** *(3-0)*. Axial's expansion path: today custodial + single-funder; the ceiling is a **funder marketplace**.

### Soroban DeFi capital context

- Blend lending crossed **~$80M TVL** on Stellar early 2026 (supporting) — the realistic near-term capital pool funders draw from.

### Refuted claims — calibrate marketing accordingly

Verification **killed** two claims worth avoiding:

- *"Tokenized receivables enable near-instant T+0 settlement vs. days-to-weeks"* — **refuted 0-3.** Don't claim instant collection settlement; Axial's advance swap is fast, but payer lockbox funding + `settle` still depends on the payer paying — and Mainnet dry-run verification remains ([`settle-dry-run-checklist.md`](settle-dry-run-checklist.md)).
- *"On-chain ledger creates an immutable golden record preventing double-financing"* — **refuted 0-2.** Tokenization alone doesn't prevent double-financing (the *legal* claim, NoA, and payer ack do — which Axial has). Frame anti-double-financing around the **NoA acknowledgement flow**, not "the blockchain prevents it."

## 5. Recommended next moves (ranked)

1. **Read-only pipeline visualization** of the three flows (Pink Raft's core idea, near-zero new risk). ← do first
2. **Clear-signing confirmation panels** (PHP amounts, named recipients, listed compliance side-effects) — verified best practice.
3. **Mainnet transparency counters** on Overview (real numbers beat Pink Raft's testnet ones).
4. **Model funder economics against Huma's velocity math** — decide pooling vs. duration-pricing before scaling.
5. **Sequence toward a funder marketplace** (onchain-factoring benchmark) once single-funder settlement is solid.
6. **Fix messaging** away from "instant/immutable" toward "fast + legally-assigned + acknowledged."

## 6. Integration assessment — Axial is already ~60% there

A code review (`web/components/views/LiquidityView.tsx`, `web/components/liquidity/TokenizationPipeline.tsx`, `web/lib/liquidity/pipeline-stage.ts`) found that **Pink Raft's core philosophy is already partly shipped in Axial**:

- `TokenizationPipeline` + the `PipelineStage` state machine (`idle → reading → parsed → minting → swapping → complete`) render a legible 3-step pipeline — **Invoice Verification → Tokenize & Swap → BIR EIS Bridge** — with per-step status and progress bars.
- That *is* Pink Raft's "one graph, legible steps" idea, live in the Liquidity view.

So "integrate Pink Raft" is **not a new build** — it is closing three specific gaps against what already exists.

### Gaps (ranked lazy → valuable)

1. **Trigger → Logic → Action framing (near-zero code).** The existing pipeline shows *runtime progress* but not the *structure* Pink Raft makes legible: what **triggers** each step, what **logic/condition** gates it, what **action** fires. The data already exists (`advance_bps 85%`, eligibility, payer-confirmed / NoA gates in `pipeline-stage.ts` and `invoice-trust`). Relabeling the three existing steps with an explicit trigger/condition/action line each turns a progress bar into "here's the machine." Edit to `TokenizationPipeline.tsx`, not a new component. **← do first**
2. **Payroll & settlement have no pipeline view.** Only the advance flow got one. Generalize `TokenizationPipeline` into a small `<Pipeline steps={...}>` and feed it three step-configs (advance / payroll / settle). One component, three configs — not three components.
3. **Clear-signing confirmation before the action fires** (the verified 3-0 best practice). `executeSwap` currently fires `mint → swap → settle` with only a progress toast. Show exactly what will happen first — "Advance ₱X to your wallet, mint receivable token, file BIR EIS within T+3" — then proceed. A small confirm panel reading values already computed, gating the existing `executeSwap`.

### What NOT to build
- ❌ A drag-drop editor or contract compiler. Axial's flows are fixed and its 4 contracts are deployed; a no-code builder to re-author hardcoded flows is pure waste.
- ❌ A graph-rendering library. Three linear steps render fine as the existing flexbox column.

## Sources

Verified via 3-vote adversarial check. Confirmed (✓) / Refuted (✗) noted.

- ✓ Pink Raft — trigger→logic→action → single Soroban contract — https://pinkraft.xyz/ *(2-1)*
- ✗ Pink Raft "audited, production-ready" templates — https://pinkraft.xyz/ *(0-2)*
- ✓ Huma $2B+ 2024, zero defaults, →$10B — https://huma.finance/ *(3-0)*
- ✓ Huma 6–10 bps daily fee, 1–5 day repay, capital recycles — https://huma.finance/ *(2-1)*
- ✓ Huma receivables-financing thesis — https://huma.finance/ *(3-0)*
- ✓ Centrifuge $1.8B TVL, 1,768 assets — https://centrifuge.io/ *(2-1)*
- ✓ Centrifuge deJTRSY/deJAAA on Stellar — https://stellar.org/blog/ecosystem/what-the-defi-is-happening-on-stellar *(3-0)*
- ✓ Centrifuge Tinlake NFT-per-invoice — https://www.gemini.com/cryptopedia/centrifuge-crypto-tinlake-tokenization-real-world-assets *(3-0)*
- ✓ Clear-signing JSON descriptor registry → readable confirmations — https://clearsigning.org/overview/ *(3-0)*
- ✓ Onchain factoring: invoices → programmable tokens, global lender network — https://chain.link/article/onchain-factoring *(3-0)*
- ✗ Tokenized receivables → near-instant T+0 settlement — https://chain.link/article/tokenized-receivables-blockchain-liquidity *(0-3)*
- ✗ On-chain "golden record" prevents double-financing — https://chain.link/article/tokenized-receivables-blockchain-liquidity *(0-2)*

Related standards / supporting reads: ERC-7730 (https://eips.ethereum.org/EIPS/eip-7730), Stellar Soroban enterprise applications (https://stellar.org/soroban/enterprise-applications), Request × Huma web3 invoice factoring (https://request.network/blog/request-and-huma-to-make-web3-invoice-factoring-a-reality).
