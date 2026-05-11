# Product Requirements Document (PRD)

**Project:** Axial  
**Date:** 2026-05-11  
**Version:** 0.1  
**Owner:** Axial Product Lead  
**Status:** Draft  
**BRD:** [brd-axial.md](brd-axial.md)

**Related:** [Design System](design-system-axial.md) · [System Design](sdd-axial.md) · [Go-To-Market](gtm-axial.md)

---

## 1. Product Purpose & Value Proposition

Axial is a **liquidity and compliance engine** for Philippine MSMEs: it lets businesses **unlock cash from tokenized receivables** through Stellar/Soroban atomic swaps into spendable PHPC (or equivalent rail), **split and route statutory payroll** obligations automatically, and **generate and submit BIR EIS payloads** after ledger-final events—so founders get **instant capital** and **invisible compliance** without legacy ERP anxiety. It is built for digitally fluent B2B operators (starting with agencies and creative/service firms) who suffer Net 60–90 terms against bi-weekly payroll and strict reporting windows.

---

## 2. Target Personas

**Primary Persona — Agency / Tech Services Founder**  
- *Who they are:* Owner or finance lead at a 10–50 person B2B shop (software, creative, specialized staffing); sells to enterprises with long payment terms.  
- *Their core frustration:* Payroll and statutory contributions are due on a clock that does not match customer cash inflows; compliance work interrupts delivery.  
- *What success looks like for them:* Payroll funds when needed, statutory slices correct, BIR/EIS status visible without fire drills—“liquidity secured and routed,” calm copy.

**Secondary Persona — Operations / Finance Manager**  
- *Who they are:* Person who runs invoices, payroll previews, and government filings.  
- *Their core frustration:* Spreadsheet brittleness, fear of EIS rejection, reconciling bank vs. on-chain vs. agency portals.

---

## 3. Core Features & Priorities

Use MoSCoW: Must-Have (launch blocker), Should-Have (next sprint), Could-Have (nice to have), Won’t-Have (explicitly cut).

| Feature | Description | Priority |
|---------|-------------|----------|
| Tokenized AR (SAC) & funding workflow | Mint/represent receivable, counterparty verification context, link to invoice metadata | Must-Have |
| Atomic swap liquidity | Lender/pool funding at discount; instant PHPC to MSME; terms & repayment schedule surfaced in UI | Must-Have |
| Statutory payroll split (contract-backed) | Calculate and route SSS, PhilHealth, Pag-IBIG (employee + employer logic) per product rules | Must-Have |
| BIR EIS bridge (off-chain) | Map ledger/consensus events to 20-field JSON, JWS sign, submit within T+3; show success reference / sync state | Must-Have |
| Overview / health dashboard | Unrushed status: liquidity lines, compliance sync, deadlines—ambient indicators vs. alarmist alerts | Must-Have |
| Settlement at invoice maturity | Buyer settlement → contract repays liquidity provider; margin to MSME (per workflow doc) | Should-Have |
| Lender / liquidity provider portal | Dedicated UI for pools or institutional partners | Could-Have |
| Multi-entity conglomerate ERP | Full group consolidation, inventory, general ledger | Won’t-Have (v1) |

---

## 4. User Stories & Acceptance Criteria

**US-01 — Fund payroll from receivables**  
> As an **Agency Founder**, I want to **tokenize a verified receivable and receive PHPC via atomic swap** so that **I can cover payroll without waiting for Net 60**.

Acceptance Criteria:  
- Given an **eligible invoice and verified buyer context**, when I **request liquidity**, then I see **clear discount/fees, expected PHPC proceeds, and repayment timing**.  
- Given **swap completion on Stellar**, when the **transaction is final**, then **proceeds appear in my designated balance/wallet path** and the **event is recorded for compliance**.

**US-02 — Statutory payroll routing**  
> As an **Ops Manager**, I want **payroll runs to compute statutory deductions and destinations automatically** so that **I avoid manual spreadsheet errors**.

Acceptance Criteria:  
- Given **a payroll batch with employee classifications**, when I **execute or preview payroll**, then I see **itemized SSS, PhilHealth, Pag-IBIG (and employer share where applicable)** consistent with encoded rules **TBD to statutory tables**.  
- Given **execution**, when **funds move per contract design**, then I can **see confirmation states** aligned with [SDD](sdd-axial.md) orchestration.

**US-03 — BIR EIS submission after financial event**  
> As a **Founder**, I want **BIR-relevant events to produce valid EIS payloads and submission status** so that **I stay within regulatory windows without manual JSON assembly**.

Acceptance Criteria:  
- Given **a ledger-final event** tied to a reportable transaction, when the **oracle maps fields**, then **a JWS-signed payload** is generated **matching BIR schema**.  
- Given **BIR acceptance**, when **submission succeeds**, then I see **success reference ID** and **immutability link/memo write-back** per architecture—and **no duplicate submit** on retry.

**US-04 — Unrushed overview**  
> As an **Ops Manager**, I want a **single overview of liquidity and compliance health** so that **I notice issues early without alert fatigue**.

Acceptance Criteria:  
- Given **active invoices, swaps, and filings**, when I open **Overview**, then I see **ambient status** (e.g., soft glow/checkmark for OK) and **actionable items only when required**.  
- Given **T+3 approaching**, when a **submission is pending**, then I see **one calm, precise call to action** (not all-caps alarm).

---

## 5. UX & Design Intent

**Design reference:** [design-system-axial.md](design-system-axial.md)

**Primary navigation (four tabs) — pattern and justification**

Axial’s information architecture maps **four primary tabs** at the root of the authenticated app. This keeps workflows aligned with product pillars: **liquidity**, **compliance/payroll/BIR**, **holistic status**, and **account governance**.

| Tab | Working name | Primary product areas | Scope |
|-----|----------------|----------------------|--------|
| **Liquidity** | “Liquidity” (or “Capital”) | Tokenized AR, atomic swaps, PHPC proceeds, lender/pool context, repayment timeline | Everything about **turning receivables into spendable funds** and understanding **cost of capital**—not payroll law tables or EIS field editors. |
| **Compliance** | “Compliance” (or “Payroll & BIR”) | Statutory payroll splits, agency wallets, BIR EIS pipeline, T+3 queue, JWS submission status | **Regulatory execution**: what must be withheld, where it routes, what went to BIR, and **audit-friendly** references. Single place avoids duplicating critical compliance UX across Overview. |
| **Overview** | “Overview” (or “Command Center”) | Cross-domain health: liquidity headroom, upcoming payroll, filing windows, silent-success indicators | **Orientation** for the Architect-minded user—strategic calm, not deep configuration. Deep edits happen in Liquidity or Compliance tabs. |
| **Settings** | “Settings” (or “Account”) | Org profile, users/roles *TBD*, connected wallets, notification preferences, environment (testnet/mainnet) *TBD*, integration toggles with **no secrets shown** | **Trust and control**: identity, security posture, and preferences—**no** primary transactional work here. |

**Why four tabs (not three or five):**  
- **Three tabs** (merge Overview into Liquidity or Compliance) would force either **capital or compliance** to own “home,” creating bias and navigation churn for half the ICP on every session.  
- **Five+ tabs** (e.g., splitting EIS from Payroll) fragments statutory workflows that are emotionally one problem for the MSME: “government and labor obligations.” Compliance stays one tab with sub-navigation *inside* as needed.  
- Matches pillars in [BRD](brd-axial.md): **inbound liquidity**, **outbound regulatory**, **central axis status**, **governance**.

**Key flows:**  
- **Get liquidity → pay people → stay compliant:** Liquidity request/swap → (funds available) → Compliance: payroll + EIS-linked events → Overview confirms “all green” / surfaces exceptions — **≤5 steps** for happy path *once onboarding complete* (exact step count TBD in implementation).  
- **Monitor without panic:** Overview opens with **passive indicators** per brand—no alarmist defaults.

**Constraints:**  
- **Dark-mode-first**; glass surfaces legible on long sessions (see DSD).  
- **Mobile-friendly** for monitoring and approvals *where safe*; high-stakes confirmations may be **desktop-first** (TBD).  
- **No credential or API key display** in UI; vault references only.  
- **Copy:** calm, precise, empowering—[brand voice](design-system-axial.md).

---

## 6. Out of Scope for This Release

- Full **HR**, recruitment, or time-clock **product**.  
- **Non-Philippine** tax packages.  
- **Discretionary AI** tax advice or autonomous filing without human review where product policy requires HITL.  
- **Public chain explorer** as sole reconciliation tool—Axial must present **human-readable** settlement and compliance status.

---

## 7. AI / Agent Feature Specifications

*No AI/LLM-driven user features are in scope for v0.1 of this PRD. Remittance classification, document OCR, or chat assistants—if added—require a dedicated PRD revision and RFC.*

---

## 8. Dependencies & Assumptions

**Dependencies:**  
- Stellar/Soroban network(s), PHPC (or chosen PHP stablecoin) availability and issuer policy **TBD**.  
- BIR EIS API access, certificate/JWS requirements, and environment (staging if offered) **TBD**.  
- Accurate statutory tables and contribution caps **TBD** (legal/accounting sign-off).  
- Liquidity providers or pool counterparties **TBD**.

**Assumptions:**  
- Target users are **English or Filipino** bilingual for v1 UI; copy locale strategy **TBD**.  
- ICP has **reliable internet**; offline mode **out of scope**.  
- [GTM](gtm-axial.md) wedge (agencies first) validates UX before distributor vertical.

---

## 9. Milestones

| Milestone | Deliverable | Target Date |
|-----------|-------------|-------------|
| M0 | Repo, environments, Soroban project skeleton, **no secrets in repo** | TBD |
| M1 | End-to-end **testnet**: mock receivable → swap → payroll split stub → EIS payload mock | TBD |
| M2 | Pilot **agency cohort**, production-like oracle/EIS path (per legal readiness) | TBD |
| Launch | **[GTM](gtm-axial.md) Phase 1** wedge launch criteria met | TBD |

---

## Self-Check

- [x] Must-Haves have story coverage  
- [x] Acceptance criteria are testable  
- [x] Out of scope listed  
- [x] Section 7 marked N/A for AI where appropriate  
- [x] Milestones present (dates TBD until planning locked)
