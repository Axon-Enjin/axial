# Go-To-Market Strategy (GTM)

**Project:** Axial  
**Date:** 2026-05-14  
**Version:** 0.2  
**Owner:** Axial Product Lead  
**Status:** Draft  
**Foundation:** [Axial.md](../Axial.md)  
**PRD:** [prd-axial.md](prd-axial.md)

**Related:** [BRD](brd-axial.md) · [DSD](dsd-axial.md) · [SDD](sdd-axial.md)

---

## 1. Product Summary (GTM View)

**What it does (one sentence):** Axial gives Philippine B2B MSMEs instant working capital from tokenized receivables and invisible compliance — statutory payroll routing and BIR EIS submission — on Stellar/Soroban, with a calm, architect-grade UI.

**Who it's for:** Digitally fluent B2B service MSMEs (10–50 people) — software, creative, specialized manpower agencies — whose enterprise buyers enforce Net 60–90 while payroll and government obligations run on shorter, non-negotiable cycles.

**Core value proposition:** "Instant capital, invisible compliance." Liquidity when you need it. Statutory and BIR flows handled as verified background outcomes, not spreadsheet panic.

**Category:** Philippine fintech infrastructure — liquidity and regulatory automation. Not generic SMB accounting. Not DeFi for its own sake.

**Competitive frame:** Axial is not competing with Xero or QuickBooks (it can complement them). It is competing with the status quo: expensive invoice factoring lines, manual government portal submissions, and fragile spreadsheets held together by an ops manager's working memory.

---

## 2. Target Audience

### Primary ICP — B2B Tech, Creative, and Specialized Manpower Agencies

- *Who:* Founders and finance leads at lean B2B service agencies; comfortable with APIs and modern UX; personally feel the payroll vs. receivables timing squeeze because their primary cost is human talent
- *Size:* 10–50 employees
- *Revenue model:* Project-based retainers, milestone billing, custom software or digital infrastructure contracts
- *Client profile:* Larger, established corporate clients enforcing Net 60–90 payment terms
- *Where they are:* Agency founder networks, Philippine tech community events (third-wave coffee shops, co-working spaces, PH startup Slack/Discord), LinkedIn (qualified segments, not spray-and-pray)
- *What they already believe:* Compliance and liquidity are cost centers they are forced to deal with; they will pay for reliability and time returned
- *What they need to convert:* Proof of the end-to-end flow — capital in, payroll out, BIR/EIS status visible — with pilot-friendly, white-glove onboarding and a real reference account they can talk to

**Why they are the wedge:**
- Digitally native — they immediately grasp the value of API bridges and automated logic; blockchain education is minimal
- Acutely feel the pain — payroll pressure is personal, not delegated
- Highly networked — one satisfied account generates multiple warm referrals through founder circles
- Short sales cycle — no procurement committee, no IT security review for pilot entry

### Secondary Audience — Institutional F&B Suppliers and B2B Distributors

- *Who:* Medium enterprises scaling production; bulk volume sales to supermarket chains, hotel groups, restaurant franchises holding payments 90–120 days
- *Why secondary:* Longer operational validation path; physical supply chain complexity requires the core infrastructure to be proven in service environments first
- *Why they matter:* Invoice volumes are higher and predictable (better yields for liquidity providers); winning them proves the system at scale and integrates Axial into the lifeblood of local commerce

---

## 3. Positioning and Messaging

**Primary tagline:** "Instant capital, invisible compliance."

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
| "Government APIs scare us." | Transparent submission states, idempotent retries, calm failure UX. Axial tells you what happened and what it is doing about it — it does not silently fail or blame you for a broken portal. |
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
| **Phase 1 — Wedge** | MVP pilot-capable on Stellar Testnet + Mainnet; EIS oracle in mock/staging mode | Hackathon (May 2026) + immediate post-hackathon | Onboard software/creative agencies; maximize UX and reliability feedback |
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

- [x] ICP is specific (agencies wedge first, F&B second, ad tax Phase 4)
- [x] Phases have product entry criteria; dates TBD pending build timeline
- [x] Objection handling is specific and substantive
- [x] Competitive frame is clear (vs. status quo, not vs. Xero)
- [ ] Pricing finalized with finance/legal
- [ ] Tracking instrumented before paid campaigns
- [ ] PTT certification timeline resolved (affects Phase 2 entry)
