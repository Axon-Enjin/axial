# Business Requirements Document (BRD)

**Project:** Axial  
**Date:** 2026-05-11  
**Version:** 0.1  
**Owner:** Axial Product Lead  
**Status:** Draft

**Related:** [Product Requirements](prd-axial.md) · [Design System](design-system-axial.md) · [System Design](sdd-axial.md) · [Go-To-Market](gtm-axial.md)

---

## 1. Executive Summary

Axial is a financial and regulatory operations platform for Philippine MSMEs that combines **instant working capital** (tokenized accounts receivable, Stellar/Soroban atomic swaps) with **invisible compliance**—statutory payroll splitting (SSS, PhilHealth, Pag-IBIG) and automated BIR Electronic Invoicing System (EIS) bridging with JWS-secured payloads. It addresses the structural mismatch between long B2B payment terms and high-frequency payroll and government reporting obligations, without requiring legacy ERP investment. Stakeholders should see Axial as the **central axis** where liquidity and compliance rotate around the business in a calm, architect-grade experience—not another anxious accounting tool.

---

## 2. The Problem & Opportunity

**The Problem:**  
Philippine MSMEs face a **liquidity–compliance squeeze**. B2B buyers often pay on Net 60–90 while payroll and statutory contributions run bi-weekly; spreadsheets capture history but cannot reconcile delayed cash with real-time regulatory logic. The BIR EIS mandate requires structured JSON reporting within tight windows (e.g., T+3), and manual payroll deduction workflows are error-prone. Traditional tools fragment factoring, tax reporting, and payroll; they do not unify **ledger finality**, **instant liquidity**, and **mandated reporting** in one pipeline.

**The Opportunity:**  
By anchoring receivables and settlement logic on Stellar/Soroban and coupling **consensus-confirmed events** to an off-chain compliance layer, Axial can make micro-invoice factoring economically viable and turn EIS submission and statutory routing into **background, verified outcomes**—aligned with Visa/IFC–scale SME funding gap narratives and Philippine regulatory direction.

**Target Customer / User:**  
**Primary:** B2B service MSMEs (e.g., tech/creative agencies, specialized manpower firms), 10–50 employees, project or milestone billing against enterprise buyers with rigid payment terms. **Secondary (later):** institutional F&B suppliers and niche B2B distributors with inventory-heavy working capital needs and complex payroll mixes.

---

## 3. Strategic Alignment

- **Revenue & growth:** Positions the product in a documented multi-hundred-billion SME funding gap while differentiating on **Philippine-native compliance** (BIR EIS, statutory funds)—not generic “invoice finance.”  
- **Regulatory timing:** Aligns with tightening EIS and structured-reporting expectations; early movers capture trust with **audit-friendly, memo-linked** on-chain references.  
- **Brand/strategy:** Execution of the [Architect](design-system-axial.md) archetype—scalable autonomous systems, minimal UI anxiety—supports premium positioning and founder-led referrals (per [GTM](gtm-axial.md)).

---

## 4. Scope

**In Scope (conceptual product):**  
- Tokenized receivables and liquidity via Stellar Asset Contracts and atomic swaps (PHPC-oriented flows).  
- Programmatic statutory payroll allocation and routing semantics (contract-level design intent).  
- Off-chain oracle/service mapping ledger events to BIR EIS JSON (20-field schema) with JWS and T+3-aware submission; success references linked back to Stellar context (e.g., memo).  
- Automated repayment/settlement when buyer settles (workflow as defined in product specs).  
- Web/mobile-first client experience with glassmorphic, dark-mode UI per brand foundation.

**Out of Scope (for this BRD / early phases):**  
- Full banking license substitution or universal fiat custody beyond defined stablecoin/rail strategy (TBD in SDD).  
- Non-Philippine regulatory packs in v1.  
- Generic full ERP replacement (GL, inventory, HRIS)—Axial focuses on **liquidity + compliance bridge**, not entire back-office replacement.  
- AI-driven advisory or autonomous tax opinion—unless explicitly added in PRD later.

---

## 5. Success Metrics

| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| MSME organizations actively funding payroll via Axial-originated liquidity | 0 | 10 pilot orgs | 9–12 months post MVP |
| EIS payloads accepted by BIR (success ref) for events sourced from Axial | 0 | ≥95% success rate on pilot volume | First 90 days of production bridge |
| Net working capital accessed via tokenized AR / swaps (pilot cohort) | 0 | TBD PHP volume—set after pilot pricing | 12 months |
| Founder NPS / “would recommend” (agency wedge ICP) | TBD survey | ≥40 | End of Phase 2 (per GTM) |

---

## 6. Stakeholders & Owners

| Role | Person | Responsibility |
|------|--------|----------------|
| Sponsor / Decision Maker | TBD | Funding, regulatory partnership strategy |
| Business Owner | TBD | Outcomes, ICP prioritization, pilot contracts |
| Product / Tech Lead | TBD | Roadmap, Soroban/oracle/EIS integration delivery |

---

## Self-Check

- [x] Section 1 is non-technical and value-oriented  
- [x] Section 2 ties liquidity and compliance quantitatively where possible  
- [x] Section 5 includes numbered targets and timelines (some baselines TBD until pilot)  
- [x] Section 4 names explicit out-of-scope items  
- [x] Build approach deferred to [SDD](sdd-axial.md), not duplicated here
