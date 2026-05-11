# Go-To-Market (GTM) Strategy

**Project:** Axial  
**Date:** 2026-05-11  
**Version:** 0.1  
**Owner:** Axial Product Lead  
**PRD:** [prd-axial.md](prd-axial.md)

**Source notes:** Phasing and ICP align with [initial GTM draft](../initial-docs/Axial_GTM_Strategy.md) and [brand](../initial-docs/Axial_Branding_Foundation.md).

---

## 1. Product Summary (GTM View)

**What it does (one sentence):** Axial gives Philippine B2B MSMEs **instant working capital from tokenized receivables** and **invisible compliance**—statutory payroll routing and BIR EIS submission—on **Stellar/Soroban**, with a calm, architect-grade UI.

**Who it's for:** Digitally fluent **B2B service MSMEs** (10–50 people) first—software, creative, specialized manpower agencies—whose enterprise buyers enforce Net 60–90 while payroll and government obligations run on shorter cycles.

**Core value proposition:** **“Instant capital, invisible compliance”** — liquidity when you need it, statutory and BIR flows handled as **verified background outcomes**, not spreadsheet panic.

**Category:** Fintech infrastructure + **Philippine regulatory automation** (liquidity + compliance), **not** generic SMB accounting.

---

## 2. Target Audience

**Primary ICP**

- *Who:* Founders and finance leads at lean B2B agencies; comfortable with APIs and modern UX; feel the **payroll vs. receivables timing** squeeze acutely.  
- *Where they hang out:* Founder networks, agency circles, tech community events, **qualified** LinkedIn segments (not spray-and-pray).  
- *What they already believe:* Compliance and liquidity are **cost centers**; they will pay for **reliability and time returned**.  
- *What will make them try this:* Proof of **end-to-end** flow—capital in, payroll out, BIR/EIS status visible—with **pilot-friendly** onboarding.

**Secondary audience**

- *Who:* Institutional F&B suppliers and B2B distributors (larger invoice volumes, inventory pressure).  
- *Why secondary:* Longer operational validation path; adopt after **agency wedge** proves atomic swaps, oracle/EIS, and payroll splitting in production.

---

## 3. Pricing Model

**Model:** `TBD — likely usage + SaaS` (e.g. platform fee + factor of liquidity / success fees). Final economics depend on regulatory posture and partner agreements.

| Tier | Price | What's Included | Limit / Gate |
|------|-------|-----------------|--------------|
| Pilot | TBD | White-glove onboarding, direct feedback channel | Capped orgs (Phase 1) |
| Standard | TBD | Self-serve **TBD** | Volume or seat gates TBD |
| Enterprise | TBD | SLA, dedicated support **TBD** | Contract |

**Pricing rationale:** Value ties to **float unlocked** and **compliance risk removed** — avoid competing on “cheapest ledger”; compete on **trust and outcomes**.

**Payment processor:** TBD (may combine fiat rails and on-chain settlement posture per SDD).

---

## 4. Positioning & Messaging

**Tagline:** **“Instant capital, invisible compliance.”**

**Primary message (hero):** Axial is the **central axis** where receivable liquidity and Philippine regulatory execution meet—**without** legacy ERP anxiety.

**Proof points:**

- End-to-end design: **SAC / swap → payroll split → EIS path** described in [BRD](brd-axial.md) and product [PRD](prd-axial.md)  
- UX aligned with **Architect** brand: dark, glass, calm copy—not alarmist fintech  
- **Philippine-native** framing (BIR EIS, SSS/PhilHealth/Pag-IBIG), not a generic “global DeFi” pitch

**Objection handling:**

| Objection | Response |
|-----------|----------|
| “Crypto is too risky for my business.” | Emphasize **regulated-adjacent** design intent: auditable flows, memos, fiat-stable orientation **PHPC**; pilot with clear ceilings. |
| “We already outsource accounting.” | Axial **absorbs execution friction**—outcome visibility and fewer fire drills; complements rather than replaces every advisor relationship. |
| “Government APIs scare us.” | Transparent submission states, retry discipline, and **calm** failure UX—not blind automation. |

---

## 5. Launch Channels & Tactics

**Owned channels:**

| Channel | Audience Size | Planned Action |
|---------|--------------|----------------|
| Founder-led outreach | TBD | Curated pilot list; referral ask in Phase 2 |
| Landing / product story | N/A | Single clear ICP + tab-based product map tying to **Overview / Liquidity / Compliance** |

**Community / earned channels:**

| Channel | Tactic | Timing |
|---------|--------|--------|
| Agency networks | Coffee-chats, peer intros, case study after first success | Phase 1–2 |
| PH tech communities | Technical blog on **architecture** (not hype) | After MVP stability |
| Press / analysts | TBD | Post-pilot proof points |

**Content assets needed before public launch:**

- [ ] 60–90s demo: **Liquidity → Compliance** happy path + Overview calm indicators  
- [ ] Landing page with ICP-specific copy (agencies first)  
- [ ] Security/trust appendix **TBD** (no secrets; high-level)  
- [ ] FAQ: BIR/T+3, what Axial does **not** automate (legal advice, etc.)

---

## 6. Launch Phases

Aligned with [initial-docs strategy](../initial-docs/Axial_GTM_Strategy.md):

| Phase | Criteria to Enter | Target Date | Goal |
|-------|------------------|-------------|------|
| **Phase 1 — Wedge** | MVP: swap + payroll path + EIS bridge **pilot-capable** | TBD | Onboard **software/creative agencies**; maximize UX and reliability feedback |
| **Phase 2 — Validation** | Phase 1 milestones; no P0 reliability gaps on core bridge | TBD | Prove atomic swaps, oracle/EIS, statutory flows in real operations; founder referrals |
| **Phase 3 — Expansion** | Stable metrics from Phase 2 | TBD | **F&B suppliers & distributors**; larger invoice throughput for liquidity side |

---

## 7. Success Metrics (30-day post-launch)

*Adjust to pilot vs. public launch; first “30-day” window may apply to **first cohort post-beta**.*

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Pilot orgs active | TBD | Org count completing ≥1 core workflow |
| EIS success rate | ≥95% on pilot volume **TBD** | Submission logs vs. BIR ack |
| Time-to-liquidity (median) | TBD | UX timestamps vs. on-chain finality |
| Founder referral intent | NPS / qualitative **TBD** | Survey post-Phase 2 |

---

## Self-Check

- [x] ICP is specific (agencies wedge first)  
- [x] Phases have product criteria, dates TBD pending build  
- [ ] Pricing finalized with finance/legal  
- [ ] Tracking instrumented before paid campaigns  
