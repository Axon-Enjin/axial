# Business Requirements Document (BRD)

**Project:** Axial  
**Date:** 2026-05-14  
**Version:** 0.2  
**Owner:** Axial Product Lead  
**Status:** Draft  
**Foundation:** [Axial.md](../Axial.md)

**Related:** [PRD](prd-axial.md) · [DSD](dsd-axial.md) · [SDD](sdd-axial.md) · [GTM](gtm-axial.md)

---

## 1. Executive Summary

Axial is a **liquidity and compliance engine** for Philippine MSMEs. It gives B2B businesses instant working capital by tokenizing accounts receivable on the Stellar/Soroban blockchain and executing atomic swaps into USDC on Stellar (PHP-denominated at the UX layer) — eliminating the Net 60–90 payroll cash crunch. At the same moment, it handles the regulatory side: automatically splitting and routing statutory payroll obligations (SSS, PhilHealth, Pag-IBIG) and generating, signing, and submitting BIR Electronic Invoicing System (EIS) payloads within the mandatory T+3 window.

The business case is "Instant Capital, Invisible Compliance." Axial is not another accounting tool that records what happened — it is infrastructure that makes things happen correctly without founder intervention.

---

## 2. The Problem and Opportunity

**The Problem:**

Philippine MSMEs face a structural **liquidity-compliance squeeze** that no existing tool resolves end-to-end:

- **Liquidity trap:** Enterprise buyers enforce Net 60–90 payment terms while payroll and statutory contributions run bi-weekly. A high-growth business can face technical insolvency not because it is unprofitable, but because its cash is locked in receivables while the payroll clock ticks.
- **Compliance burden:** The BIR Electronic Invoicing System mandate (December 31, 2026 deadline) requires structured JSON reporting within T+3, JWS-signed, via API — beyond the reach of the 56% of MSMEs still using spreadsheets and email. Manual SSS/PhilHealth/Pag-IBIG processing breaks when contribution brackets change and exposes founders to retroactive penalties.
- **Tool gap:** Traditional SaaS accounting tools record the lack of cash; they do not generate it. They record a tax liability; they do not execute the payment. The market needs infrastructure where money is programmable and compliance is automatic.

**The Opportunity:**

The Stellar blockchain provides the exact architecture required: instant settlement via USDC on Stellar (PHP fiat rail via PDAX and SEP-24 abstraction for future anchors), Soroban smart contracts for programmable routing logic, and ledger finality as an audit-grade compliance trigger. By anchoring receivables and settlement on Stellar and coupling consensus events to an off-chain compliance oracle, Axial makes micro-invoice factoring economically viable and turns EIS submission and statutory routing into verified background outcomes.

The BIR EIS December 2026 deadline currently binds Phase 1 taxpayers — Large Taxpayers Service registrants, e-commerce entities, exporters, businesses with annual gross sales ≥ ₱1B, and CAS/CBA users. Subsequent phases covering a broader taxpayer base are on the BIR roadmap. This creates regulatory urgency that pulls the market without marketing spend. Axial is positioned to be the compliance-aware infrastructure layer that qualifying MSMEs must adopt, and that growth-stage MSMEs will want to adopt ahead of their own phase deadline.

**The $221 Billion Context:**

Visa and the International Finance Corporation document a $221 billion SME funding demand in the Philippines against a $15 billion formal supply. Banks deny MSME loans citing unstable cash flow and lack of physical collateral. Axial shifts underwriting to on-chain receivable quality and smart contract execution — making collateral-free factoring viable at the micro-invoice scale (₱30k–₱100k) for the first time.

**Target Customer:**

*Primary:* B2B service MSMEs — software, creative, specialized manpower agencies — 10–50 employees, project or milestone billing against enterprise buyers with rigid payment terms. Digitally native, networked, short sales cycle.

*Secondary (later phases):* Institutional F&B suppliers and B2B distributors; larger invoice volumes, inventory-heavy working capital needs, complex payroll mixes.

Full ICP analysis and GTM phasing in [Axial.md §8](../Axial.md) and [GTM](gtm-axial.md).

---

## 3. Strategic Alignment

**Regulatory timing:** The BIR EIS December 2026 deadline aligns the market to us without advertising. Early movers capture trust with audit-friendly, on-chain memo-linked references that latecomers cannot replicate retroactively.

**Market size:** The $221B SME funding gap, 99.59% MSME share of all Philippine businesses, and 65.1% employment share establish this as a structural infrastructure play, not a niche product.

**Brand alignment:** The Architect archetype — scalable autonomous systems, minimal UI anxiety, empowering not alarmist — supports premium positioning and founder-led referrals. See [Axial.md §6](../Axial.md).

**Stellar ecosystem:** USDC on Stellar (Circle-issued, Mainnet), PDAX as the named PHP fiat rail via PDAX Connect (SEP-24 abstraction allows Coins.ph and future PHP-Stellar anchors to plug in without changing contract logic), and Soroban's maturity in 2025–2026 make the technical architecture viable today in a way it was not two years ago.

**DTI MSMED Plan 2023–2028:** Government explicitly targets digitalization as a cross-cutting survival strategy. Axial is aligned with, not against, the regulatory direction of travel (Continuous Transaction Control is where BIR is headed — Axial's chain-as-compliance-trigger architecture is CTC-native).

---

## 4. Scope

**In Scope — v1:**

- Tokenized accounts receivable via Stellar Asset Contracts (SAC) and atomic swaps (USDC on Stellar, with PHP fiat rail via PDAX)
- Programmatic statutory payroll allocation and routing (SSS, PhilHealth, Pag-IBIG — employee and employer shares)
- Off-chain oracle mapping ledger events to BIR EIS JSON (20-field schema), JWS-signed, T+3-aware submission with success references linked to Stellar memos
- Automated buyer settlement and liquidity provider repayment on invoice maturity
- Web-first client with glassmorphic dark-mode UI per [DSD](dsd-axial.md); four-tab navigation (Liquidity, Compliance, Overview, Settings)

**Out of Scope — v1:**

- Digital advertising tax withholding module (RMC 5-2024 / programmable corporate treasury) — Phase 4
- Full banking license or fiat custody beyond defined stablecoin/rail strategy
- Non-Philippine regulatory packages
- General ledger, ERP, inventory management, or HRIS replacement
- AI-driven tax advisory or autonomous filing without human review
- Offline mode

Full decision rationale at [Axial.md §10](../Axial.md).

---

## 5. Success Metrics

| Metric | Baseline | Target | Timeline |
|---|---|---|---|
| MSME organizations actively funding payroll via Axial liquidity | 0 | 10 pilot orgs | 9–12 months post-MVP |
| BIR EIS payloads accepted (success ref) for Axial-sourced events | 0 | ≥95% success rate on pilot volume | First 90 days of production bridge |
| Net working capital accessed via tokenized AR / swaps (pilot cohort) | 0 | TBD PHP volume — set after pilot pricing locked | 12 months |
| Founder NPS / "would recommend" (agency wedge ICP) | TBD survey | ≥40 | End of Phase 2 |
| Time-to-liquidity (median, from request to USDC in wallet) | TBD | TBD — establish in M1 testnet | Post-M1 |

---

## 6. Stakeholders and Owners

| Role | Person | Responsibility |
|---|---|---|
| Sponsor / Decision Maker | TBD | Funding, regulatory partnership strategy |
| Business Owner | TBD | Outcomes, ICP prioritization, pilot contracts |
| Product / Tech Lead | TBD | Roadmap, Soroban/oracle/EIS integration delivery |
| Legal / Compliance Advisor | TBD | Statutory table accuracy, BIR PTT certification, BSP sandbox compliance |
| Liquidity Partner | TBD | Institutional capital or pool counterparty for atomic swaps |

---

## 7. Constraints and Assumptions

**Constraints:**
- BIR EIS December 31, 2026 deadline is externally fixed and immovable
- USDC on Stellar is the settlement asset (Circle-issued, Mainnet); PHP fiat rail via PDAX (BSP-licensed VASP); Axial never custodies fiat
- BIR PTT (Permit to Transmit) certification is required before production EIS submission — timeline TBD
- Statutory contribution tables must be legally reviewed before encoding in smart contracts

**Assumptions:**
- Target ICP has reliable internet; offline mode is not required
- English/Filipino bilingual UI is sufficient for v1
- Liquidity providers can be sourced before or during Phase 1 pilot
- Stellar Testnet and Mainnet remain available and stable for the hackathon and subsequent development

---

## Self-Check

- [x] Section 1 is non-technical and value-oriented
- [x] Section 2 ties liquidity and compliance to quantified market data
- [x] Section 5 has numbered targets with timelines (some TBD until pilot sizing)
- [x] Section 4 explicitly names out-of-scope items with rationale
- [x] Build approach deferred to [SDD](sdd-axial.md), not duplicated here
