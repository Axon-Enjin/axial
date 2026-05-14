# Product Requirements Document (PRD)

**Project:** Axial  
**Date:** 2026-05-14  
**Version:** 0.2  
**Owner:** Axial Product Lead  
**Status:** Draft  
**Foundation:** [Axial.md](../Axial.md)  
**BRD:** [brd-axial.md](brd-axial.md)

**Related:** [DSD](dsd-axial.md) · [SDD](sdd-axial.md) · [GTM](gtm-axial.md)

---

## 1. Product Purpose and Value Proposition

Axial is a **liquidity and compliance engine** for Philippine MSMEs. It lets businesses unlock cash from tokenized receivables through Stellar/Soroban atomic swaps into USDC on Stellar (proceeds displayed in PHP), automatically split and route statutory payroll obligations (SSS, PhilHealth, Pag-IBIG), and generate and submit BIR EIS payloads after ledger-final events — so founders get **instant capital** and **invisible compliance** without legacy ERP anxiety.

Built for digitally fluent B2B operators — starting with software and creative agencies — who suffer Net 60–90 terms against bi-weekly payroll and strict government reporting windows.

The design posture is The Architect: calm, structured, autonomous. The experience should feel like a system that runs correctly in the background, not a dashboard that demands attention.

---

## 2. Target Personas

**Primary Persona — Agency / Tech Services Founder**

- *Who:* Owner or finance lead at a 10–50 person B2B shop (software, creative, specialized staffing) selling to enterprises with long payment terms
- *Core frustration:* Payroll and statutory contributions are due on a clock that does not match customer cash inflows; compliance work interrupts delivery and requires manual effort the founder does not have time for
- *What success looks like:* Payroll funded when needed, statutory slices correct and routed automatically, BIR/EIS status visible without fire drills — the system handles it, the founder moves on

**Secondary Persona — Operations / Finance Manager**

- *Who:* Person who runs invoice processing, payroll previews, and government filings within the same MSME
- *Core frustration:* Spreadsheet brittleness, fear of EIS rejection, reconciling bank vs. on-chain vs. government agency portal states
- *What success looks like:* Single source of truth for compliance state; submission history with on-chain audit links; no manual re-entry between systems

---

## 3. Core Features and Priorities

MoSCoW: Must-Have (launch blocker) · Should-Have (next sprint) · Could-Have (nice to have) · Won't-Have (explicitly cut for v1)

| Feature | Description | Priority |
|---|---|---|
| Tokenized AR (SAC) and funding workflow | Register receivable, mint SAC token representing the right to payment, link to invoice metadata and verified buyer context | Must-Have |
| Atomic swap liquidity | Lender/pool funding at calculated discount; instant USDC delivery (PHP-denominated in UI); discount terms, repayment schedule, and net proceeds surfaced clearly in UI | Must-Have |
| Statutory payroll split (contract-backed) | Calculate and route SSS, PhilHealth, Pag-IBIG (employee + employer shares) per current statutory tables; preview before execution | Must-Have |
| BIR EIS bridge (off-chain oracle) | Map ledger/consensus events to 20-field BIR JSON schema; JWS sign; submit within T+3; surface success reference ID and Stellar memo link; idempotent retry on failure | Must-Have |
| Overview / health dashboard | Ambient status: liquidity lines, compliance sync state, filing deadlines — passive indicators (glow, checkmark) not alarmist alerts; surfaces exceptions only when action is required | Must-Have |
| Automated settlement at invoice maturity | Buyer settlement routes to smart contract; contract repays liquidity provider; margin returned to MSME; visible in Liquidity tab timeline | Should-Have |
| Payroll preview and approval flow | Show itemized statutory breakdown before execution; require explicit approval on high-stakes payroll runs | Should-Have |
| Compliance submission history and audit log | Paginated history of EIS submissions with BIR reference IDs, Stellar memo links, timestamps, retry states | Should-Have |
| Lender / liquidity provider portal | Dedicated UI for institutional partners to view pool exposure, yield, and repayment schedules | Could-Have |
| Multi-entity / conglomerate consolidation | Full group-level ERP consolidation | Won't-Have (v1) |
| Digital ad tax module (RMC 5-2024) | Programmable treasury for FWT/VAT on foreign platform ad spend | Won't-Have (v1) — Phase 4 |

---

## 4. User Stories and Acceptance Criteria

**US-01 — Fund payroll from receivables**
> As an **Agency Founder**, I want to tokenize a verified receivable and receive USDC via atomic swap (proceeds displayed in PHP) so that I can cover payroll without waiting for Net 60.

Acceptance Criteria:
- Given an eligible invoice and verified buyer context, when I request liquidity, then I see clear discount/fees, expected settlement proceeds (in PHP), and repayment timing before confirming
- Given swap completion on Stellar, when the transaction is final, then proceeds appear in my designated balance and the event is recorded for compliance processing
- Given a failed or pending swap, when I check status, then I see a human-readable state (not a raw transaction hash) with next steps

**US-02 — Statutory payroll routing**
> As an **Ops Manager**, I want payroll runs to compute statutory deductions and route to government agencies automatically so that I avoid manual spreadsheet errors and missed brackets.

Acceptance Criteria:
- Given a payroll batch with employee classifications, when I preview payroll, then I see itemized SSS, PhilHealth, and Pag-IBIG (employee and employer shares) computed against current statutory tables
- Given I approve the batch, when funds execute per the Soroban contract, then I see confirmation of routing to each agency and can link to the on-chain record
- Given a contribution rate update in legislation, when the statutory tables are updated in the system, then the next payroll run reflects the new brackets without manual formula edits

**US-03 — BIR EIS submission after financial event**
> As a **Founder**, I want BIR-relevant events to produce valid EIS payloads and submission status so that I stay within T+3 without manual JSON assembly.

Acceptance Criteria:
- Given a ledger-final event tied to a reportable transaction, when the oracle maps fields, then a JWS-signed payload matching the 20-field BIR schema is generated
- Given BIR acceptance, when submission succeeds, then I see the success reference ID in the Compliance tab and the reference is written to the Stellar memo
- Given a submission failure, when the system retries, then it uses idempotency keys — no duplicate submissions on retry
- Given T+3 approaching for a pending submission, when the window is within 24 hours, then I see one calm, precise prompt — not an all-caps alarm

**US-04 — Unrushed overview**
> As an **Ops Manager**, I want a single view of liquidity and compliance health so that I notice issues early without alert fatigue.

Acceptance Criteria:
- Given active invoices, swaps, and filings in good standing, when I open Overview, then I see ambient positive indicators (soft glow or checkmark for synced state) — no urgent call to action
- Given an exception requiring attention (e.g., a submission failed and T+3 window is closing), when I open Overview, then I see exactly one clear, calm action item surfaced
- Given I navigate to Liquidity or Compliance from Overview, when I land on the tab, then I pick up exactly where the Overview indicator pointed me

---

## 5. UX and Design Intent

Full design specification in [DSD](dsd-axial.md). The intent documented here is the product-level rationale — the DSD holds the implementation detail.

### Navigation: Four Tabs

Axial's IA maps four primary tabs at the root of the authenticated app. The order is: **Liquidity → Compliance → Overview → Settings**.

| Tab | Working name | Primary product areas |
|---|---|---|
| **Liquidity** | "Liquidity" | Tokenized AR, atomic swaps, settlement proceeds (USDC on Stellar, PHP-denominated UI), lender context, repayment timeline |
| **Compliance** | "Compliance" | Statutory payroll splits, agency routing, BIR EIS pipeline, T+3 queue, JWS submission status |
| **Overview** | "Overview" | Cross-domain health: liquidity headroom, upcoming payroll, filing windows, ambient indicators |
| **Settings** | "Settings" | Org profile, users/roles, connected wallets, notification preferences, environment, integrations |

**Why four (not three or five):**
- Three would make Overview a sub-section of either Liquidity or Compliance, creating navigation bias and churn for half the ICP
- Five would split statutory payroll from EIS compliance — but they are emotionally one problem ("government obligations") for the MSME; sub-navigation within Compliance handles the separation when needed
- Matches the four product pillars in the BRD: inbound liquidity / outbound regulatory / central axis status / governance

### Key Flows

**Happy path (post-onboarding):** Liquidity request → swap confirmation → (funds available) → Compliance: payroll preview + approval → EIS event auto-submitted → Overview shows all green. Target: ≤5 steps.

**Monitor without panic:** Overview opens with passive indicators as the default state. Alarmist is never the default.

### UX Constraints

- **Dark-mode-first.** Glass surfaces must be legible on long sessions.
- **Mobile-friendly for monitoring and approvals** where safe; high-stakes confirmations (swap execution, payroll approval) may be desktop-first — to be decided in implementation.
- **No credential or API key display** in UI; vault references only.
- **Copy voice:** Calm, precise, empowering. "Payroll liquidity secured and routed." Never "URGENT: Action Required." See [Axial.md §6.4](../Axial.md).

---

## 6. Out of Scope for This Release

- Full HR, recruitment, or time-clock product
- Non-Philippine tax packages
- AI-driven tax advice or autonomous filing without human review
- Digital advertising tax withholding module (RMC 5-2024) — Phase 4
- Public chain explorer as the sole reconciliation mechanism — Axial always presents human-readable status alongside on-chain references
- Offline mode

---

## 7. AI / Agent Feature Specifications

No AI/LLM-driven user-facing features are in scope for v1. If anomaly explanation, document OCR, or chat assistants are added in future, they require a dedicated PRD revision and RFC.

---

## 8. Dependencies and Assumptions

**Dependencies:**
- Stellar/Soroban network availability and USDC on Stellar Mainnet (Circle-issued; issuer `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`)
- BIR EIS API access and PTT (Permit to Transmit) certification — TBD; required before production submission
- Accurate statutory tables (SSS, PhilHealth, Pag-IBIG) legally reviewed and signed off — TBD
- Liquidity providers or pool counterparties willing to participate in pilot — TBD
- BIR EIS staging/sandbox environment availability — TBD

**Assumptions:**
- Target users are English/Filipino bilingual for v1 UI
- ICP has reliable internet; offline mode is out of scope
- GTM wedge (agencies first per [Axial.md §8](../Axial.md)) validates UX before distributor vertical

---

## 9. Milestones

| Milestone | Deliverable | Target |
|---|---|---|
| M0 | Repo, environments, Soroban project skeleton, no secrets in repo | Hackathon Day 1 (May 18) |
| M1 | End-to-end testnet: mock receivable → atomic swap → payroll split stub → EIS payload mock | Hackathon Day 5 (May 22) |
| M2 | Pilot agency cohort, production-like oracle/EIS path (subject to legal and PTT readiness) | TBD post-hackathon |
| Launch | GTM Phase 1 wedge launch criteria met per [GTM](gtm-axial.md) | TBD |

---

## Self-Check

- [x] Must-Haves have story coverage
- [x] Acceptance criteria are testable and human-readable
- [x] Out of scope listed explicitly
- [x] Section 7 marked N/A for AI
- [x] Milestones present (post-hackathon dates TBD until planning locked)
- [x] All cross-links updated to reference Axial.md and new doc names
