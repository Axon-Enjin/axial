# Request for Comments (RFC) / Tech Spec

**Title:** Closed-Loop Confirmed-Invoice Settlement
**Date:** 2026-05-19
**Author:** Carlos Jerico de la Torre
**Status:** `Approved`
**PRD Reference:** [prd-axial.md §3 Core Features](prd-axial.md), §9 Milestones
**SDD Reference:** [sdd-axial.md §3 Data Architecture](sdd-axial.md), §4 Stellar/Soroban, §5 Compliance
**RFC ID:** `axial-rfc-001`

---

## 1. Context & Objective

**The problem this solves:**

The original Axial flow assumed the B2B payer would voluntarily route invoice payment to the smart contract. Nothing forced this. A payer who never onboarded can pay the MSME the old way (bank transfer), leaving the MSME with both the advance and the payment and the funder with nothing — textbook **payment-redirection factoring fraud**. Adjacent failure modes: fake/inflated invoices, payer default with no recourse, disputed/partial payment, FX gap on the collection leg.

You cannot technically force an off-system third party to pay a contract. The objective is therefore a **closed loop**: make the in-system path the only easy path, make leaving the system a *provable breach by the MSME/payer rather than a loss to the funder*, and detect leakage in days.

**Reference in PRD/SDD:**
This RFC implements the locked "Settlement model" decision in [Axial.md §11](Axial.md) and the closed-loop steps in Axial.md §7.1. It adds the payer/confirmation/NoA/lockbox/reconciliation surfaces to the SDD.

**Success criteria:**
- No receivable is fundable unless the payer is KYB'd, has confirmed the invoice, and has e-acknowledged a Notice of Assignment.
- Off-system payment by an acknowledged payer does not discharge the debt (legal) **and** is detected and escalated within T+X days of due date (technical).
- Funder principal is never structurally exposed beyond the reserve + recourse envelope.
- Demo-able end-to-end on Stellar Mainnet within the hackathon window without external dependencies.

---

## 2. Proposed Solution

**Approach:**

Insert a mandatory **Step 0** before tokenization and replace the open settlement assumption with a controlled lockbox + reconciliation loop.

```
Payer onboarding (KYB) ─► Invoice raised by MSME ─► Payer confirms invoice
       └─► Notice of Assignment generated ─► Payer e-acknowledges NoA
              └─► [GATE] confirmed + acknowledged? ──No──► not fundable
                                                   └─Yes─► SAC mint
                                                           └─► atomic_swap
                                                               (advance 80–90%,
                                                                reserve held,
                                                                recourse bound)
                                                               └─► payroll split
                                                                   └─► EIS oracle
On due date: payer pays ──► designated lockbox/collection address
              └─► settlement contract: repay funder + release reserve + margin to MSME
Reconciliation worker (continuous): due & lockbox empty by T+X
              └─► freeze MSME · notify funder · trigger recourse · blacklist
```

Eligibility gate (Step 0) kills fraud at the root; NoA shifts liability off the funder; reserve+recourse protects honest default; reconciliation catches leakage. These four are independent and layered — defeating one does not collapse the loop.

**Architecture changes:**
- New domain: **Payer (debtor) registry** with KYB state.
- New flow: **invoice confirmation** + **Notice of Assignment** issuance and e-acknowledgement.
- New on-chain construct: **lockbox** (per-invoice collection target) wired into the settlement contract.
- New worker: **reconciliation/leakage** scanner with auto-escalation.
- New ledger: **reserve & recourse** accounting.
- Soroban: settlement contract gains reserve release; assets issued **clawback-enabled** + `AUTH_REQUIRED` so fraudulent flows are revocable and statutory tokens stay whitelisted.

---

## 3. Technical Details & Contracts

### Data Model Changes

```sql
-- The enterprise client who owes the money. No funding without a row here.
CREATE TABLE payers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES orgs(id),     -- the MSME that invoices them
  legal_name    TEXT NOT NULL,
  tin           TEXT NOT NULL,
  kyb_status    TEXT NOT NULL CHECK (kyb_status IN ('pending','verified','rejected')),
  contact_email TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payer's explicit confirmation that the invoice + amount + due date are owed.
CREATE TABLE invoice_confirmations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receivable_id   UUID NOT NULL REFERENCES receivables(id),
  payer_id        UUID NOT NULL REFERENCES payers(id),
  confirmed_amount NUMERIC(18,2) NOT NULL,
  due_date        DATE NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('pending','confirmed','disputed')),
  confirmed_at    TIMESTAMPTZ
);

-- Notice of Assignment + payer e-acknowledgement. Legal core (Civil Code 1624–1635).
CREATE TABLE notices_of_assignment (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receivable_id   UUID NOT NULL REFERENCES receivables(id),
  payer_id        UUID NOT NULL REFERENCES payers(id),
  noa_document_ref TEXT NOT NULL,                       -- stored artifact (signed PDF / hash)
  lockbox_address TEXT NOT NULL,                        -- the ONLY payment instruction (settlement contract ID on Mainnet; demo GAXL fallback when chain off)
  ack_status      TEXT NOT NULL CHECK (ack_status IN ('issued','acknowledged','refused')),
  ack_method      TEXT CHECK (ack_method IN ('in_app','signed_pdf')),
  acknowledged_at TIMESTAMPTZ
);

-- Per-invoice collection target the payer pays into.
CREATE TABLE lockboxes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receivable_id   UUID NOT NULL REFERENCES receivables(id),
  stellar_address TEXT NOT NULL,
  expected_amount NUMERIC(18,2) NOT NULL,
  funded_amount   NUMERIC(18,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL CHECK (status IN ('open','settled','leaked','disputed'))
);

-- Funder protection accounting.
CREATE TABLE reserve_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receivable_id   UUID NOT NULL REFERENCES receivables(id),
  advance_amount  NUMERIC(18,2) NOT NULL,               -- ~80–90% of face
  reserve_held    NUMERIC(18,2) NOT NULL,               -- holdback
  recourse_status TEXT NOT NULL CHECK (recourse_status IN ('none','triggered','recovered','written_off')),
  released_at     TIMESTAMPTZ
);
```

Extend existing `swaps`/`receivables` state machine with: `awaiting_payer_confirmation`, `awaiting_noa_ack`, `fundable`, `funded`, `settled`, `leaked`, `disputed`, `recourse`.

### API Changes

```
POST /api/payers                      -- onboard payer (MSME-initiated), starts KYB
GET  /api/payers/:id                   -- KYB status

POST /api/receivables/:id/confirm      -- payer confirms invoice (payer-auth token)
  Request:  { confirmed_amount, due_date }
  Response: { status: "confirmed" | "disputed", noa_required: true }

POST /api/noa/:receivableId/issue      -- system issues NoA, returns lockbox address
POST /api/noa/:receivableId/ack        -- payer e-acknowledges
  Request:  { ack_method: "in_app" | "signed_pdf", artifact_ref? }
  Response: { ack_status: "acknowledged", fundable: true }

GET  /api/receivables/:id/eligibility  -- the funding GATE
  Response: { fundable: boolean, blockers: ["payer_kyb"|"confirmation"|"noa_ack"] }

POST /api/disputes                     -- payer/MSME raises dispute
POST /api/reconciliation/scan          -- worker-internal; idempotent
```

The funding endpoint (`POST /api/swaps`) MUST call the eligibility gate and reject with `409 NOT_FUNDABLE` + blockers if any gate condition fails. This is the single enforcement point — no bypass path.

### State Management

Reconciliation is a scheduled worker (same queue tech as the EIS submission worker — see Axial.md Q1), not client-polled. The UI subscribes to receivable state; "leaked"/"recourse" states drive the Funder Protection Center and a calm (non-alarmist) notification. No client-side polling.

---

## 4. Alternatives Considered

| Option | Why Rejected |
|--------|-------------|
| Open factoring (original model) — fund any MSME-asserted invoice, hope the payer pays the contract | The core fraud hole. Payer never consented; off-system payment is the default behavior, not the exception. Unfundable risk for any real funder. |
| Pure technical lock (escrow only, no NoA) | A smart contract cannot compel an un-onboarded third party to pay it. Without the legal assignment, off-system payment still discharges the debt and the funder eats the loss. Technology alone cannot close this. |
| Non-recourse + 97% advance (original numbers) | Removes the funder's only protection on honest payer default/insolvency. Reserve + recourse is the standard factoring risk envelope; dropping it makes the book uninsurable. |
| Notify payer but don't require acknowledgement | Under PH Civil Code, the assignment binds the debtor on notice — but an explicit acknowledgement is the difference between an arguable position and an evidentiary one in a dispute. Cheap to require; expensive to omit. |

---

## 5. AI / Agent Implementation Notes

*No AI/LLM component in the settlement loop.* KYB may later use a vendor's automated risk scoring; out of scope for this RFC and flagged as an automated-decision item in [clr-axial.md §3](clr-axial.md).

---

## 6. Security, Privacy & Performance

**Security surface:**
- Payer-auth tokens are scoped to a single receivable confirmation/ack — they cannot enumerate or act on other invoices.
- The eligibility gate is the sole funding enforcement point; it is server-side and cannot be satisfied by client-supplied state.
- Stellar assets issued **clawback-enabled** + `AUTH_REQUIRED`: a receivable token minted on a later-disproven invoice can be revoked; statutory tokens only flow to whitelisted government addresses.
- Lockbox addresses are derived per-invoice and never reused; a leaked address cannot be repointed.
- **Update (B-2 S5, 2026-07-15):** `settleOnChain` reads the settlement contract's USDC SAC balance before calling `settlement::settle`. Empty lockbox → hard error (502 to client). `collectedAmount` is capped to on-chain balance for partial recovery. `onChainInvoiceId` on `factoring_invoices` must match `register_invoice` id at swap time — payer portal calls `mark_collected` after lockbox fund and returns `settlement.txHash` in the API response.
- **Update (B-2 S4, 2026-05-22):** NoA `lockboxAddress` now resolves to the single Mainnet `settlement` contract ID (`cfg.settlementContractId`), not the earlier `deriveDemoLockbox` GAXL string — per-invoice attribution is recorded inside the contract via `register_invoice(invoice_id, …)` rather than via distinct on-chain addresses. The demo GAXL string remains only as an off-chain fallback when settlement chain config is absent.

**Performance:**
- Reconciliation scan is O(open invoices); bounded batch size, runs on schedule, never blocks a user request or chain confirmation.
- Eligibility gate is a single indexed read across three tables — sub-10ms; safe in the funding hot path.

**Privacy:**
- Payer KYB data (legal name, TIN, contact) is PII under the **PH Data Privacy Act 2012 (RA 10173)** — inventory, retention, and DPO obligations tracked in [clr-axial.md](clr-axial.md). NoA artifacts may contain payer signatures: store encrypted at rest, access-logged.

---

## 7. Execution Plan

**Can this ship behind a feature flag?** Partially — `CLOSED_LOOP_ENFORCED=true` gates the funding eligibility check. For the hackathon demo it is **on** (the closed loop *is* the differentiator). Off only for isolated contract testing.

**Ticket breakdown** (these feed PRD §9 Milestones — keep phase mapping consistent):

| Ticket | Description | Size | Phase |
|--------|-------------|------|-------|
| `CLS-01` | DB migration — payers, invoice_confirmations, notices_of_assignment, lockboxes, reserve_ledger | M | P1 |
| `CLS-02` | Payer onboarding API + KYB state machine (mock KYB provider for demo) | M | P1 |
| `CLS-03` | Invoice confirmation API + payer-scoped auth tokens | M | P1 |
| `CLS-04` | NoA issuance + e-acknowledgement (in-app click for demo; signed-PDF path stubbed) | M | P1 |
| `CLS-05` | Funding eligibility gate wired into `POST /api/swaps` (hard reject path) | S | P1 |
| `CLS-06` | Soroban: settlement contract reserve release + clawback-enabled / AUTH_REQUIRED asset issuance | L | P2 |
| `CLS-07` | Per-invoice lockbox address derivation + wiring into settlement contract | M | P2 |
| `CLS-08` | Reserve & recourse ledger logic (advance %, holdback, recourse trigger) | M | P2 |
| `CLS-09` | Reconciliation/leakage worker + auto-escalation (freeze/notify/blacklist) | M | P2 |
| `CLS-10` | Dispute + partial-payment workflow (state + resolution path) | M | P3 |
| `CLS-11` | Calm notification triggers (funding, mid-tenor, pre-due, leak) — brand-voice compliant | S | P3 |
| `CLS-12` | Funder Protection Center + Trust & Boundary screen (UI) | M | P3 |

**Rollout order:** CLS-01 → 02/03/04 (Step 0 path) → 05 (gate, nothing funds without it) → 06/07/08 (on-chain + reserve) → 09 (reconciliation) → 10/11/12 (dispute, notifications, UI). P1 = Day 2–3, P2 = Day 3–5, P3 = Day 5–6 against the Axial.md day-by-day skeleton.

*These tickets map to `prd-axial.md` §9. Closed-loop UI surfaces are specified in `prd-axial.md` §3/§5.*

---

## Self-Check

- [x] Section 3 has exact schema DDL — not vague descriptions
- [x] Section 3 API changes have exact request/response shapes and name the single enforcement point
- [x] Section 4 has real rejected alternatives (open factoring, escrow-only, non-recourse, notify-without-ack) — not strawmen
- [x] Section 5 marked N/A with rationale (no AI in the loop)
- [x] Section 7 ticket list is actionable and phase-mapped to PRD §9
- [x] No duplication of global architecture (lives in SDD) or feature copy (lives in PRD)
