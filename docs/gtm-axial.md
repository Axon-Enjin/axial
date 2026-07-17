# Go-To-Market Strategy (GTM)

**Project:** Axial  
**Date:** 2026-07-17  
**Version:** 0.3  
**Owner:** Axial Product Lead  
**Status:** Draft  
**Foundation:** [Axial.md](../Axial.md)  
**PRD:** [prd-axial.md](prd-axial.md)  
**Resilience / payroll plan:** [plans/resilience-stablecoin-payroll/overview.md](plans/resilience-stablecoin-payroll/overview.md)

**Related:** [BRD](brd-axial.md) · [DSD](dsd-axial.md) · [SDD](sdd-axial.md)

---

## 1. Product Summary (GTM View)

**What it does (one sentence):** Axial gives Philippine B2B MSMEs instant working capital from tokenized receivables and effortless compliance — statutory payroll routing and review-and-submit BIR EIS filing — on Stellar/Soroban, with a calm, architect-grade UI.

**Who it's for:** Export-facing B2B service MSMEs first (software, creative, BPO/manpower agencies) whose foreign clients pay Net 60–90 while local payroll and BIR run on shorter cycles. Secondary: foreign founders with PH teams who hold USDC and need compliant last-mile PHP wages; Web3-native startups that need a regulatory bridge.

**Core value proposition:** "Instant capital, effortless compliance." Liquidity when you need it. Statutory and BIR filings prepared for you and submitted on your approval — verified outcomes, not spreadsheet panic.

**Category:** Philippine fintech infrastructure — liquidity and regulatory automation. Not generic SMB accounting. Not DeFi for its own sake.

**Competitive frame:** Axial is not competing with Xero or QuickBooks (it can complement them). It is competing with the status quo: expensive invoice factoring lines, manual government portal submissions, and fragile spreadsheets held together by an ops manager's working memory.

---

## 2. Target Audience

### Primary ICP — Local export-facing agencies (tech, creative, BPO / specialized manpower)

- *Who:* Founders and finance leads at lean B2B service agencies; bill foreign or enterprise clients on Net 60–90 while paying local staff bi-weekly
- *Size:* 10–50 people (employees + contractors)
- *Revenue model:* Retainers, milestone billing, outbound services priced in USD/foreign currency, costs in PHP
- *Client profile:* Overseas buyers or large PH enterprises with long AP cycles
- *Where they are:* Agency founder networks, PH tech/BPO communities, LinkedIn (qualified segments)
- *What they already believe:* Liquidity and compliance are cost centers; they will pay for reliability and time returned
- *What they need to convert:* Proof — capital in, payroll funded, BIR/EIS status visible — with white-glove pilot onboarding
- *Web3 posture:* Prefer a calm PHP UI. Stellar/USDC stays under the hood unless they ask

**Why they are the wedge:**
- Pain is cash-flow timing, not “learn blockchain”
- Digitally fluent enough to adopt modern UX without DeFi education
- Highly networked — one reference account seeds warm intros
- Short sales cycle vs. enterprise procurement

### Secondary ICP — Foreign founders with PH teams

- *Who:* Non-PH founders operating PH entities or EORs; treasury often in USDC/crypto
- *Pain:* Remittance fees and friction converting stablecoins to PHP for salaries and statutory remittances
- *Axial value:* Fund operations in USDC; Track B fiat-bridged payroll (when live) + Co-Pilot EIS; contractors may be paid USDC on-chain (Track A, Labor Code Art. 102 aware)

### Secondary ICP — Web3-native startups

- *Who:* Teams already on Stellar/crypto rails that still must satisfy BIR and statutory agencies
- *Axial value:* Regulatory bridge — stay on-chain where legal, stay compliant where the Labor Code and BIR demand fiat/process

### Tertiary — Institutional F&B suppliers and B2B distributors

- *Who:* Medium enterprises selling into supermarket/hotel/franchise AP cycles (90–120 days)
- *Why later:* Physical supply-chain complexity; prove agency wedge first
- *Why they matter:* Higher invoice volume for liquidity partners once core is stable

---

## 3. Positioning and Messaging

**Primary tagline:** "Instant capital, effortless compliance." *(Updated 2026-06-18; "invisible compliance" retired as headline — north-star vision only.)*

**Hero message:** Axial is the central axis where receivable liquidity and Philippine regulatory execution meet — without legacy ERP anxiety.

**Proof points:**
- End-to-end architecture: SAC tokenization → atomic swap → payroll split → EIS submission — one pipeline, one UI
- Philippine-native design: BIR EIS fields, SSS/PhilHealth/Pag-IBIG brackets, T+3 compliance — not a generic "global DeFi" product adapted for PH
- Calm by design: dark, glass, architect-minded UI — not alarmist fintech

**Objection handling:**

| Objection | Response |
|---|---|
| "Crypto is too risky for my business." | Axial settles on Stellar using USDC — a dollar-backed stablecoin issued by Circle, regulated under US law, and integrated with Visa and PayPal. PHP conversion happens at the edges via PDAX, a BSP-licensed exchange. You are not holding speculative crypto; you are using programmable payment infrastructure with a PHP front door. |
| "We already outsource accounting." | Axial absorbs execution friction — payroll runs, EIS submissions, statutory routing — so your accountant reviews outcomes rather than performs manual steps. Complements, does not replace, advisor relationships. |
| "Government APIs scare us." | Transparent submission states, idempotent retries, calm failure UX. T+3 approach and expiry notify in-app; live BIR never auto-submits without human approve. |
| "Can we pay staff in USDC?" | Independent contractors may be paid USDC on Stellar (Track A, Testnet-first). Regular employees must receive PHP legal tender (Labor Code Art. 102) via a licensed fiat edge (Track B, mock until partner). |
| "Why not just use invoice factoring?" | Traditional factoring requires physical collateral and takes days. Axial tokenizes the receivable on-chain and delivers settlement proceeds in minutes (USDC on Stellar, shown in PHP), with no collateral requirement — underwriting is based on on-chain receivable quality and smart contract execution. |

---

## 4. Pricing Model

**Philosophy:** Value ties to float unlocked and compliance risk removed — not to ledger transaction count. Compete on trust and verified outcomes, not on "cheapest per submission."

**Model:** Usage + SaaS hybrid (TBD — likely platform fee + liquidity success fee / factor). Final economics depend on regulatory posture and liquidity partner agreements.

| Tier | Price | What's included | Gate |
|---|---|---|---|
| Pilot | TBD | White-glove onboarding, direct feedback channel, full feature access | Capped orgs, Phase 1 only |
| Standard | TBD | Self-serve onboarding, core features | Volume or seat gates TBD |
| Enterprise | TBD | SLA, dedicated support, custom liquidity arrangements | Contract |

**Payment processor:** TBD — may combine fiat rails and on-chain settlement posture per [SDD](sdd-axial.md).

---

## 5. Launch Channels and Tactics

**Owned channels:**

| Channel | Planned action |
|---|---|
| Founder-led direct outreach | Curated pilot list from existing founder networks; warm intros only in Phase 1 |
| Landing page / product story | Single clear ICP message + tab-based product map (Overview → Liquidity → Compliance); no blockchain jargon in hero copy |

**Community and earned channels:**

| Channel | Tactic | Timing |
|---|---|---|
| Agency and tech founder networks | Coffee-chats, peer intros, reference case study after first success | Phase 1–2 |
| PH tech community | Technical blog on architecture (not hype) — how the EIS oracle + Soroban pipeline works; targets ops-minded founders | After MVP stability |
| Hackathon network | Build on Stellar Philippines 2026 — proof of technical credibility with the Stellar ecosystem | May 2026 |
| Press / analysts | TBD | Post-pilot proof points available |

**Content assets required before public launch:**

- [ ] 60–90s demo video: Liquidity → Compliance happy path + Overview calm indicators
- [ ] Landing page with agency-first ICP copy
- [ ] Security and trust FAQ: what Axial does not automate (legal advice, BSP license), how keys are protected, what happens on BIR API failure
- [ ] Pilot onboarding guide: what the MSME needs to bring (TIN, BIR PTT status, employee records) and what Axial handles

---

## 6. Launch Phases

Aligned with [Axial.md §8.3](../Axial.md):

| Phase | Entry Criteria | Target | Goal |
|---|---|---|---|
| **Phase 1 — Wedge** | Pilot-capable on Stellar Testnet + Mainnet; EIS oracle in mock/staging mode | Hackathon (May 2026) + immediate post-hackathon | Onboard software/creative agencies; maximize UX and reliability feedback |
| **Phase 2 — Validation** | Phase 1 milestones met; no P0 reliability gaps on core bridge (swap + payroll + EIS) | TBD post-hackathon | Prove atomic swaps, oracle/EIS, and statutory flows in real production operations; activate founder referrals |
| **Phase 3 — Expansion** | Stable Phase 2 metrics; ≥95% EIS success rate sustained; NPS ≥40 | TBD | F&B suppliers and distributors; larger invoice throughput; grow liquidity provider pool |
| **Phase 4 — Ad Tax Module** | Core infrastructure stable; clear demand signal from marketing-agency segment | TBD | Launch RMC 5-2024 programmable treasury as a vertical add-on (Candidate 2 from [Axial.md §3](../Axial.md)) |

---

## 7. Success Metrics

*First "30-day" window applies to first cohort post-beta, not public launch.*

| Metric | Target | How to measure |
|---|---|---|
| Pilot orgs active | TBD (target 10 by month 9) | Org count completing ≥1 core workflow (swap or payroll run) |
| EIS success rate | ≥95% on pilot volume | Submission logs vs. BIR acknowledgement count |
| Time-to-liquidity (median) | TBD — establish baseline in M1 testnet | UX request timestamp vs. USDC settlement in wallet |
| Founder referral intent | NPS ≥40 | Survey at end of Phase 2 |
| Statutory accuracy | 100% match to legal tables | Audit against SSS/PhilHealth/Pag-IBIG published schedules |

---

## Self-Check

- [x] ICP is specific (export agencies wedge; foreign founders + Web3 startups secondary; F&B tertiary; ad tax Phase 4)
- [x] Phases have product entry criteria; dates TBD pending build timeline
- [x] Objection handling is specific and substantive
- [x] Competitive frame is clear (vs. status quo, not vs. Xero)
- [ ] Pricing finalized with finance/legal
- [ ] Tracking instrumented before paid campaigns
- [ ] PTT certification timeline resolved (affects Phase 2 entry)
