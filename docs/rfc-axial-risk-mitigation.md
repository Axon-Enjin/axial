# Request for Comments (RFC) / Risk Register

**Title:** Risk, Fraud & Failure-Mode Register
**Date:** 2026-06-18
**Author:** Carlos Jerico de la Torre
**Status:** `Living`
**RFC ID:** `axial-rfc-003`
**Related:** [Axial.md §7.1, §11](Axial.md) · [rfc-axial-closed-loop-settlement.md](rfc-axial-closed-loop-settlement.md) · [clr-axial.md](clr-axial.md) · [scrutiny-pbw.md](scrutiny-pbw.md)

---

## 1. Why this document exists

The hackathon judges' central challenge was: **"What if the company closes? What if it's a scam? How do you prevent these things?"** This register is the structured answer. It enumerates every material way Axial can lose money, break the law, or break trust — and states, for each, the **current mitigation**, the **remaining gap**, and the **planned mitigation**.

Two principles, both learned from industry blowups (see [scrutiny-pbw.md](scrutiny-pbw.md)):

1. **Protection is structural, never a promise.** We never say "this can't happen." Greensill and Goldfinch said versions of that. We say "if it happens, here is who absorbs it and how we detect it."
2. **Layers are independent.** Defeating one control does not collapse the system. The closed loop has four independent layers (eligibility gate → NoA → reserve+recourse → reconciliation); compliance adds a fifth (human review).

> ⚠️ **Structural/regulatory awareness only — not legal advice.** Items marked **[counsel]** must be reviewed by a licensed PH attorney before production.

**Severity legend:** Likelihood (L) and Impact (I) each rated Low / Med / High. Priority = the combination.

---

## 2. Fraud & abuse risks

| # | Risk | L | I | Current mitigation | Gap | Planned mitigation |
|---|------|---|---|--------------------|-----|--------------------|
| F1 | **Fake / fictitious invoice** — funding a sale that never happened | Med | High | Payer is KYB'd and must **confirm the invoice in-app** before funding; eligibility gate hard-rejects unconfirmed receivables (`409 NOT_FUNDABLE`) | KYB is mocked in the demo | Real KYB/KYB-vendor integration; document verification at onboarding |
| F2 | **Double financing** — same invoice pledged to two funders | Med | High | One on-chain mint per invoice (`receivable_token.is_minted`) makes re-tokenization on Axial impossible | Does not stop the MSME pledging the *same paper* to a competitor off-Axial | Register assignment in the **PPSA receivables registry**; check registry before funding |
| F3 | **Inflated invoice** — real sale, exaggerated amount | Med | Med | Payer confirms the **exact amount + due date**; advance is a % of the *confirmed* face, not the asserted face | — | Cross-check against payer's PO/history; concentration + size limits |
| F4 | **Pre-invoicing / future-receivable fraud** (the Greensill failure) | Low | High | We fund **only confirmed, due-dated receivables** — never speculative or future flow. This is a hard architectural rule | — | Keep the rule inviolable; never relax the confirmation gate for "trusted" clients |
| F5 | **Payment redirection** — payer pays MSME directly, funder unpaid | High | High | **NoA + designated lockbox**: under Civil Code Arts. 1624–1635, once the payer acknowledges assignment, paying the MSME does **not** discharge the debt; reconciliation detects empty lockbox | NoA text needs counsel **[counsel]**; on-chain `settle` path still being wired (B-2 S5) | Counsel-reviewed NoA; finish on-chain settlement + reconcile |
| F6 | **Collusion** — MSME + payer conspire on a fake/inflated sale | Low | High | Recourse + personal guarantee on the MSME; clawback-enabled assets (revocable); behavioral monitoring | Hardest fraud to fully prevent; we do not claim immunity | Concentration limits per payer-MSME pair; anomaly detection; staged limits for new relationships |
| F7 | **Account / key takeover** | Low | High | Payer-auth tokens scoped to a single receivable; server-side eligibility gate cannot be satisfied by client state | Custodial keys are a central target (see O3) | MFA, hardware-backed keys, move to MPC/self-custody |

---

## 3. Counterparty & credit risks

| # | Risk | L | I | Current mitigation | Gap | Planned mitigation |
|---|------|---|---|--------------------|-----|--------------------|
| C1 | **MSME closes / goes insolvent after taking the advance** | Med | High | The funder is repaid by the **payer** (who owes the money), not the MSME — the advance is recovered from the receivable itself via the lockbox. Reserve + recourse cover shortfalls | Recourse enforceability needs counsel **[counsel]** | Counsel-reviewed recourse + guarantee; first-loss reserve sizing |
| C2 | **Payer defaults / goes insolvent** (the genuine credit risk) | Med | High | Advance is **80–90%, not 97%** — funder holds a reserve buffer; recourse to the MSME on non-payment; we underwrite the *payer's* credit, not just the MSME's | No external credit data on payers in v1 | Payer credit assessment; concentration limits; optional credit insurance (the cover whose loss sank Greensill — so we treat it as a layer, not the foundation) |
| C3 | **Payer disputes the invoice** (quality dispute → withholds payment) | Med | Med | Dispute workflow (`/api/disputes`); funding only on a *confirmed* invoice reduces but doesn't eliminate later disputes | Dispute resolution path is P3, partially built | Full dispute/partial-payment state machine; reserve absorbs disputed margin |
| C4 | **Concentration risk** — book too dependent on one payer/MSME/sector | Med | High | — (not enforced in v1) | No limits coded | Per-payer / per-MSME / per-sector exposure caps before scaling |
| C5 | **FX moves against the book** between advance (USDC) and settlement | Med | Med | Denomination-agnostic contracts; rate read at swap time; hardcoded 56.5 fallback | No rate-lock or hedge; FX risk is real, not cosmetic | Reflector rate-lock window written to contract storage; hedging policy [counsel/treasury] |

---

## 4. Operational & technical risks

| # | Risk | L | I | Current mitigation | Gap | Planned mitigation |
|---|------|---|---|--------------------|-----|--------------------|
| O1 | **Compliance oracle fails / misses an event** | Med | Med | Fire-and-forget oracle never blocks the user; `eis/worker` retries inside T+3; `eis/horizon-poll` ingests missed chain events; idempotency key `orgId:txHash:refId` | Cron jobs not yet wired as GCP Cloud Scheduler | Wire schedulers; alerting on stuck `queued`/`failed` |
| O2 | **Wrong data submitted to BIR** (OCR/mapping error) | Med | High | **Human-in-the-loop review** before any submission (Co-Pilot pivot) — a person approves the prepared filing | Live submission not built (mock); no PTT | Certified software + PTT; validation rules; review UI as the hard gate |
| O3 | **Custodial key compromise** — server holds funder/MSME/issuer secrets | Low | High | Secrets in env/secret-manager, never in repo; mainnet keys gitignored | Single point of failure; custody question | Migrate to Freighter/MPC self-custody; HSM/KMS; per-role key isolation |
| O4 | **USDC freeze / blacklist by Circle** (happened to 16 wallets, Mar 2026) | Low | High | Awareness; funds move quickly through the loop rather than sitting | We rely on a centralized asset with coded freeze powers | Multi-asset readiness (contracts are denomination-agnostic); operational runbook; minimize idle balances |
| O5 | **Stellar / Horizon / RPC outage** | Low | Med | Circuit breaker + provider failover (SDD); user requests never block on chain | Failover not load-tested | Multi-RPC redundancy; degraded-mode UX |
| O6 | **Demo / live-presentation failure at PBW** | Med | Med | — | No fallback recorded yet | **Recorded demo video** as fallback (see [pbw-script.md](pbw-script.md)); rehearse 3× |

---

## 5. Compliance & regulatory risks

| # | Risk | L | I | Current mitigation | Gap | Planned mitigation |
|---|------|---|---|--------------------|-----|--------------------|
| R1 | **Auto-filing liability** — Axial files a wrong/fraudulent return on a client's behalf | Med | High | **Pivoted to human-in-the-loop Co-Pilot** — Axial prepares; a person reviews and submits. No silent auto-submission | — (this is the fix) | Keep the human checkpoint mandatory until certified auto-submit is justified per-client |
| R2 | **No Permit to Transmit (PTT) / uncertified software** | High | High | We are explicit that live BIR submission is mock-gated (`BIR_EIS_LIVE`); we do not claim a live BIR link | We cannot legally transmit to BIR production today | Pursue EIS enrolment + software certification + PTT before any live transmission |
| R3 | **Axial is an unlicensed financing activity** — factoring/discounting AR is a financing-company act under **RA 8556** (needs SEC Certificate of Authority) | High | High | v1 reframed: Axial = tech + origination rails; the **licensed financing entity / qualified funders** are the lenders of record | Entity/CA posture unresolved **[counsel]** | Counsel on structuring: own CA vs partner-of-record; confirm before any real funding |
| R4 | **Assignment-transfer restriction** — assigned receivables may transfer only to defined regulated buyers (banks/NBFIs/financing cos/insurers/GFIs), **not an open pool** | High | High | Reframed funders as regulated/qualified partners (PDAX LP network), not anonymous on-chain pools | — | Funder agreements with eligible institutions only **[counsel]** |
| R5 | **Data Privacy Act (RA 10173)** — financial PII + payer KYB + automated eligibility | High | Med | CLR inventory + sensitivity flags; NoA artifacts encrypted, access-logged | DPO undesignated; PIA not done | **Launch gate:** designate DPO, complete PIA, breach runbook (72h NPC), DSR path |
| R6 | **VASP/BSP exposure** at the crypto/fiat edge | Med | Med | Axial never custodies fiat (PDAX/anchor edge); SEP-24 abstraction | Custodial *crypto* posture undefined | Counsel on VASP applicability; keep fiat at licensed anchor |
| R7 | **Statutory bracket error** (SSS/PhilHealth/Pag-IBIG amounts wrong) | Med | Med | Brackets as versioned rule packs, not hardcoded in Soroban | Tables need accounting sign-off | Legal/accounting review of bracket tables before production |

---

## 6. Strategic & thesis risks (the honest list)

| # | Risk | Why it matters | Posture |
|---|------|----------------|---------|
| S1 | **Chicken-and-egg GTM** — the closed loop needs the enterprise *payer* onboarded before the small *seller* can be funded | Onboarding big buyers is the slow, hard part | Deliberate wedge: start where the payer is already motivated (existing buyer relationships, anchor-introduced); name it openly as the hard part, not a solved problem |
| S2 | **Liquidity sourcing unsolved** — "PDAX's 20+ LP network" is a pipeline, not a contract | No funders = no product | Present as partnership pipeline; do not claim committed capital |
| S3 | **Micro-invoice unit economics** — KYB + legal + origination cost may exceed a ₱30k ticket's margin | The "factoring micro-invoices" claim may not pencil out yet | Lead with agency-sized invoices; treat micro-tickets as an automation goal |
| S4 | **Custodial-first design** limits trust with sophisticated users | Self-custody is the Stellar-native expectation | Roadmap to Freighter/MPC (O3) |
| S5 | **"Blockchain doesn't fix credit risk"** (the Goldfinch lesson) | On-chain rails ≠ underwriting | Pitch *discipline + settlement rails*, never "DeFi underwrites MSMEs" |

---

## 7. The one-paragraph answer to "What if the company closes / it's a scam?"

> *Axial is built so that a bad actor or a failed business is the **counterparty's** problem to cause and **our system's** problem to catch — never the funder's silent loss.* A receivable can't be funded unless the **payer is verified and confirms the invoice** (kills fake/inflated invoices). The **Notice of Assignment** means once the payer acknowledges it, paying anyone but the lockbox doesn't clear the debt (kills payment redirection). The advance is **80–90% with a holdback reserve and recourse**, so an honest default lands inside a designed buffer, not on the funder's principal. A **reconciliation worker** freezes the account and escalates within days if a due invoice's lockbox is empty (leakage is caught, not discovered at year-end). And on the compliance side, **a human reviews and approves every filing** before it goes to BIR — so an error or a fraudulent invoice is caught by a person, not rubber-stamped by a robot. Four independent financial layers, one human checkpoint. We don't promise fraud is impossible; we promise it's expensive to attempt, structurally contained when it happens, and detected fast.

---

## Self-Check

- [x] Every risk has likelihood, impact, a current mitigation, a named gap, and a planned mitigation
- [x] Counsel-needed items flagged **[counsel]** and cross-referenced to [clr-axial.md](clr-axial.md)
- [x] No risk is answered with "this can't happen"
- [x] §7 gives a presenter-ready answer to the judges' exact question
- [x] Strategic/thesis risks (§6) included honestly, not just technical ones
