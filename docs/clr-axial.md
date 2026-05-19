# Compliance & Legal Readiness Register (CLR)

**Project:** Axial
**Date:** 2026-05-19
**Version:** 0.1
**Owner:** Carlos Jerico de la Torre
**PRD:** [prd-axial.md](prd-axial.md)
**SDD:** [sdd-axial.md](sdd-axial.md)

---

> ⚠️ **Structural and regulatory awareness only — NOT legal advice.** This register maps the data Axial handles and surfaces obligations. It does not draft the Privacy Policy, Terms of Use, or the Notice of Assignment, and it does not replace a licensed attorney. Every item flagged **"counsel needed"** must be reviewed by a lawyer qualified in the Philippines before launch. Financial data and the assignment-of-credit mechanism make this banner mandatory.

---

## 0. Target Markets

Axial is **Philippines-first** by design. v1 has no non-PH regulatory packages and the ICP is PH B2B MSMEs and their PH enterprise payers. The web app is not geo-blocked, but no users are solicited or onboarded outside the Philippines in v1.

| Region | In scope? | Notes |
|--------|-----------|-------|
| European Union / UK (GDPR / UK GDPR) | No | No EU/UK users solicited or onboarded in v1. Revisit if expansion. |
| California, USA (CCPA / CPRA) | No | No US users in v1. |
| Philippines (Data Privacy Act 2012, RA 10173) | **Yes** | Primary and only declared market. Drives the whole register. |
| Other | No | Out of scope v1 — consult counsel before any expansion. |

**Geo-blocking:** None today. v1 onboarding is invite/pilot-gated to PH entities, which functionally limits the population; formal geo-blocking is a counsel-needed decision before open signup.

---

## 1. Data Inventory / Record of Processing

| Activity | Purpose | Data categories | Data subjects | Recipients / sub-processors | Cross-border transfer | Retention | Legal basis |
|----------|---------|-----------------|---------------|-----------------------------|-----------------------|-----------|-------------|
| MSME org & user auth | Account access, RBAC | Name, email, role, auth subject | MSME founders/staff | Auth vendor (TBD) | TBD (likely US) | Account life + statutory min | Contract |
| MSME KYC | Onboarding, fraud, regulatory | Legal name, TIN, business reg | MSME principals | KYB/KYC vendor (mocked for hackathon; TBD prod) | TBD | Statutory financial-records period (counsel) | Legal obligation / contract |
| **Payer (debtor) KYB** | Closed-loop gate, fraud prevention | Legal name, TIN, contact email | B2B payer entities/contacts | KYB vendor (TBD) | TBD | Duration of receivable + statutory min | Legitimate interest / contract |
| Invoice & receivable data | Tokenization, funding, settlement | Amounts, due dates, parties, terms | MSME + payer | Liquidity providers (deal data), Stellar (on-chain refs) | On-chain (public ledger) | Statutory financial-records period | Contract / legal obligation |
| Notice of Assignment artifacts | Legal collection right | Payer acknowledgement, signature/e-ack, lockbox ref | Payer | Stored encrypted; funder (status only) | TBD | Duration of claim + limitation period | Legal obligation |
| Payroll & statutory data | Statutory split + routing | Employee identifiers, gross/net, SSS/PhilHealth/Pag-IBIG amounts | MSME employees | Government agency addresses (on-chain) | On-chain | Statutory payroll-records period | Legal obligation |
| BIR EIS submission | Tax compliance | 20-field invoice schema, JWS sig | MSME + payer | BIR (government) | Domestic (BIR) | Per BIR retention rules | Legal obligation |
| Audit log | Security, dispute, regulatory | Actor, action, entity, timestamp | All users | Internal | No | Long retention (counsel) | Legitimate interest / legal obligation |

**Sensitivity flags:**

| Data type | Collected? | Notes |
|-----------|-----------|-------|
| Basic PII (name, email) | Yes | MSME users, payer contacts, employees |
| Special-category / sensitive | No | No health/biometric/political data |
| Children's data | No | B2B only; users are adults |
| Precise location | No | Not collected |
| Photos / camera / microphone | No | Not collected |
| Device IDs / advertising IDs | No (v1) | No ad SDKs in v1 |
| Analytics / telemetry | TBD | If added, declare and add to inventory |
| Crash logs | TBD | If added, declare |
| Payment / card data | **Yes (financial)** | Receivables, payroll, settlement amounts, TINs — financial data, not card PAN. Axial never custodies fiat (PDAX edge), reducing but not eliminating scope |

**Self-check:**

| Item | Done? | Evidence link | Counsel needed? |
|------|-------|---------------|-----------------|
| Every processing activity has a retention period | No — several TBD | | Yes |
| Every sub-processor is named and has a DPA in place | No — KYB/auth vendors TBD | | Yes |
| Inventory is dated and treated as a living document | Yes | this file | No |

---

## 2. Multi-Jurisdiction Obligations Matrix

Only the Philippines column is in scope (Section 0).

| Dimension | Philippines DPA 2012 (RA 10173) |
|-----------|----------------------------------|
| **Consent / legal basis** | Consent or other lawful criteria (contract, legal obligation, legitimate interest). Financial/regulatory processing largely rests on legal obligation + contract. |
| **Data subject rights** | Access, correct, erase/block, object, portability, claim damages. Payer and MSME-employee data subjects included. |
| **Breach notification** | NPC **and** affected subjects within 72h of knowledge if real risk of serious harm. Runbook required. |
| **DPO / representative** | **Mandatory DPO** + Privacy Impact Assessment + Privacy Management Program. Financial data raises the bar. |
| **Cross-border transfer** | Controller stays accountable; comparable protection required. Auth/KYB vendors likely offshore → contractual safeguards needed. |
| **Our status / action** | DPO designated: **TBD — counsel needed before launch.** PIA required (financial data + automated KYB). NoA mechanism requires counsel sign-off. |

**Watch list:** NPC issuances on financial data and outsourcing; evolving rules on automated decision-making (KYB scoring); BIR EIS data-handling guidance; BSP/VASP guidance touching anchor-edge flows.

**Self-check:**

| Item | Done? | Evidence link | Counsel needed? |
|------|-------|---------------|-----------------|
| Consent / legal-basis model defined per processing activity | Partial | §1 table | Yes |
| Working data-subject-request path (access/delete) | No — to build | | Yes |
| Breach response runbook with 72h NPC timeline | No — to build | | Yes |
| DPO designated; PIA + Privacy Management Program in place | No | | **Yes — launch gate** |

---

## 3. Escalation Flags — Counsel Required

Multiple "Yes" → banner is set; **do not launch any funding surface without PH counsel**.

| Flag | Present? | Why it escalates |
|------|----------|------------------|
| Children's data | No | B2B adults only |
| Health / medical data | No | Not collected |
| Payments / financial data | **Yes** | Receivables, payroll, TINs, settlement. Factoring/assignment of credit is a regulated financial activity in substance — counsel must confirm licensing/structuring posture (lending, financing-company, or VASP-edge characterization) |
| Biometric data | No | Not collected |
| Large-scale / systematic monitoring or profiling | **Yes** | Continuous reconciliation + transaction reporting at scale; PIA likely mandatory |
| Automated decisions with legal/significant effect | **Yes (potential)** | Funding eligibility gate + future automated KYB risk scoring can have significant effect on the MSME — subject rights attach; document human-in-the-loop |
| Sale / share / cross-context behavioral advertising | No | No adtech in v1 |
| Operating with no local entity | TBD | Confirm Axial's PH entity status — counsel |
| **Assignment of credit / Notice of Assignment** | **Yes** | The legal core of the closed loop. NoA enforceability under PH Civil Code Arts. 1624–1635, recourse terms, and personal guarantee must be drafted and reviewed by PH counsel before any production funding |

**DPIA / PIA required?** **Yes** — financial data + large-scale reconciliation + automated eligibility. Complete a Privacy Impact Assessment before production processing (out of scope for this register — counsel + NPC guidance).

---

## 4. Terms of Use / EULA Readiness

Presence-check only — counsel drafts the text. The **Trust & Boundary** screen (PRD §3/§5) is where the in-system-settlement and liability-shift clauses are surfaced and acknowledged.

| Clause | Present? | Counsel needed? |
|--------|----------|-----------------|
| License grant + scope | No — to draft | |
| Acceptable use / prohibited conduct (incl. **no off-system settlement**) | No — to draft | Yes |
| Limitation of liability + warranty disclaimer | No | Yes |
| Governing law + jurisdiction (Philippines) | No | Yes |
| Dispute resolution (arbitration / venue) | No | Yes |
| Termination + suspension (incl. **freeze on leakage / blacklist**) | No | Yes |
| **Notice of Assignment + payer acknowledgement terms** | No | **Yes — launch gate** |
| **Recourse + personal guarantee terms (MSME)** | No | **Yes — launch gate** |
| Funder agreement (advance %, reserve, repayment, recourse waterfall) | No | **Yes — launch gate** |
| Modification / notice mechanism | No | |
| Payment / fee terms (discount fee, platform cut, subscription) | No | Yes |
| Privacy Policy incorporated by reference | No | Yes |

---

## 5. IP Infringement & Protection Readiness

| Item | Status | Counsel needed? |
|------|--------|-----------------|
| "Axial" name trademark knockout search (PH, relevant classes) | Not done | Yes |
| Open-source license compliance — SBOM maintained | Not started | |
| Copyleft scan (GPL/AGPL/LGPL) | Not started | |
| Third-party assets licensed (fonts: Geist; Material Symbols) | Verify licenses | |
| AI training-data / model-output (N/A — no AI in product v1) | N/A | |
| DMCA / takedown process | N/A v1 (no UGC) | |
| Written IP assignment from every contractor / dev | Not done — 3-dev team | Yes |

---

## 6. App Store / Platform Compliance

Not applicable — Axial is web-first in v1. Revisit if a mobile app ships.

---

## Self-Check

- [x] Section 0 declares the market (PH only) and is honest about no geo-blocking
- [x] Section 1 has one row per processing activity; retention gaps flagged as counsel-needed
- [x] Section 2 filled for the one in-scope region (Philippines)
- [x] Every Section 3 "Yes" has a counsel action; banner is set (financial data + NoA)
- [x] Section 4 ToU/agreement clauses presence-checked; launch-gate items marked
- [ ] SBOM exists and copyleft scanned — **open, pre-launch**
- [x] Section 6 N/A (web-first) recorded
- [x] This document maps and escalates obligations — it does not give legal advice

**Launch gate summary (must clear before GTM):** DPO designated + PIA complete · NoA + recourse + funder agreement drafted and counsel-reviewed · financial-activity licensing posture confirmed · breach runbook + DSR path live.
