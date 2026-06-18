# Axial — Pre-PBW Scrutiny Brief

**Date:** 2026-06-18
**Author:** Product/strategy review ahead of Philippine Blockchain Week (Day 1, SMX)
**Purpose:** Stress-test the Axial thesis against industry reality before we present to a Philippine fintech/regulator/investor audience. Feeds [`rfc-axial-risk-mitigation.md`](rfc-axial-risk-mitigation.md), the doc pivots in [`Axial.md`](Axial.md), the [`pbw-script.md`](pbw-script.md), and the deck.

> ⚠️ **Structural and regulatory awareness only — not legal advice.** Philippine-jurisdiction items must be reviewed by a licensed PH attorney before any production funding. This brief maps obligations and risks; it does not resolve them.

---

## 0. TL;DR — what survived scrutiny, what didn't

**The judges' core challenge** (*"What if the company closes? What if it's a scam? How do you prevent it?"*) is the single most important thing to answer on stage. The honest finding: **our closed-loop design already answers most of it — but we were not telling that story, and two real holes remain (we are a financing activity in the eyes of the SEC, and our compliance promise overreached).**

| Claim we made | Verdict after scrutiny | What changes |
|---|---|---|
| "Instant Capital, **Invisible** Compliance" — BIR EIS filed automatically in the background | ⚠️ **Overreach + not built.** Auto-submitting tax filings to a government system without human review is a liability, and we have no Permit to Transmit. | **Pivot to a human-in-the-loop "Compliance Co-Pilot"** — Axial *prepares* EIS-ready filings + statutory schedules; a person reviews and submits. Full auto-submit becomes a PTT-gated roadmap item. |
| Confirmed-invoice closed loop (payer KYB + NoA + lockbox + recourse + reserve) | ✅ **Strongly validated.** This is exactly the discipline whose absence sank Greensill and stressed Goldfinch. | Promote it from a buried "settlement-integrity" note to the **headline risk story** in the deck. |
| Open on-chain "institutional liquidity pools / DeFi backers" advance the cash | ⚠️ **Regulatorily fragile in PH.** Factoring is a financing-company activity (RA 8556); assigned receivables can only be transferred to a defined set of regulated buyers. | Reframe funders as **regulated/qualified liquidity partners**, not an open pool. Position Axial as the rails + originator, with the licensed financing entity in the loop. |
| Settlement in USDC on Stellar is "no external dependency" | ⚠️ **Partly false.** USDC carries Circle counterparty + freeze/blacklist risk; it is USD, so FX risk to the peso-denominated MSME is real, not cosmetic. | Name it openly as a managed risk; keep the denomination-agnostic contract design as the mitigation. |
| Micro-invoice factoring (₱30k–₱100k) is newly economic | 🟡 **Unproven.** Per-invoice KYB + legal + origination cost can swamp a small ticket. | Lead the wedge with larger agency invoices; treat micro-tickets as a volume/automation goal, not a day-one claim. |

---

## 1. How receivables finance actually fails (and what it teaches us)

### 1.1 The fraud taxonomy
The factoring industry has a well-documented set of failure modes. Every one of them maps to a defense we either have or need:

| Fraud type | What it is | Axial's structural answer |
|---|---|---|
| **Fake / fictitious invoices** | Invoicing for a sale that never happened, then financing it | **Payer KYB + explicit in-app confirmation** before funding — no confirmation, no money |
| **Double financing / double-pledging** | Selling the *same* invoice to two or more funders | One on-chain mint per invoice (`receivable_token.is_minted`); + a receivables-registry check (PH **PPSA** registry) before funding |
| **Pre-invoicing / future receivables** | Financing goods/services not yet delivered | Fund only **confirmed, due-dated** receivables — never speculative/future flow |
| **Collusion (client + debtor)** | MSME and payer conspire to confirm a fake sale | Hardest case. Mitigated by recourse + personal guarantee + concentration limits + behavioral monitoring; never claimed as "impossible" |
| **Payment redirection** | Payer pays the MSME the old way, leaving the funder unpaid | **NoA + designated lockbox** — under Civil Code Arts. 1624–1635, once notified, paying the MSME does **not** discharge the debt |

Sources: [IFA — Hidden Risks of Fraud in Factoring](https://magazine.factoring.org/magazine-articles/the-hidden-risks-of-fraud-in-factoring-and-invoice-discounting), [eCapital — 7 ways bad actors submit fraudulent invoices](https://ecapital.com/blog/7-common-ways-bad-actors-submit-fraudulent-invoices/).

### 1.2 Greensill ($10B+ collapse, 2021) — the cautionary headline
Greensill turned low-risk confirmed-payables finance into **speculative lending against "future receivables" — unconfirmed sales**. German regulator BaFin found the bank "was unable to provide evidence of the existence of receivables," and Greensill financed **related-party** deals where buyer and seller weren't independent. ([GTR](https://www.gtreview.com/supplements/gtr-scf-2021/greensill-gfg-uncovering-scandal/), [Finverity](https://finverity.com/insights/greensill-debacle-lessons-for-supply-chain-finance-industry))

**Lesson for Axial:** our *entire* funding gate is "confirmed receivable or nothing." Greensill is the slide that makes our closed loop look like foresight, not bureaucracy.

### 1.3 On-chain RWA credit (Goldfinch, Centrifuge, Maple) — "blockchain doesn't fix credit risk"
Goldfinch took multiple real defaults: ~$5M (Tugende), a $20M loan (~$7M at risk, Stratos), and a $5.9M loss (Lend East, 2024) — after which it restructured to route capital only through **institutional credit managers with 10+ year track records**. The widely-cited lesson: *on-chain infrastructure improves operational efficiency but does not change the underlying credit risk; it requires institutional underwriting discipline.* ([CoinDesk](https://www.coindesk.com/markets/2023/10/09/real-world-asset-loan-worth-20m-sours-on-defi-platform-goldfinch-bringing-rwa-lending-under-scrutiny))

**Lesson for Axial:** do not pitch "DeFi pools underwrite Filipino MSMEs." Pitch **disciplined underwriting + on-chain settlement**. The chain is the rails and the audit trail — not the underwriter.

---

## 2. Why "Invisible Compliance" had to change

### 2.1 The product reason
Auto-submitting a JWS-signed tax document to BIR with **no human checkpoint** means: if the source data is wrong (OCR error, wrong TIN, misclassified VAT), Axial files a wrong government return on the client's behalf, automatically, within T+3 — and amendments/penalties are the client's problem. For a regulated tax process, "invisible" is not a feature, it's an uninsured liability. Businesses are rightly nervous about it — which is exactly the instinct behind this pivot.

### 2.2 The factual reason
We **do not have** the integration. BIR EIS requires **enrolment, BIR-approved/certified software, and a Permit to Transmit (PTT)** before any production transmission; our build uses a mock endpoint (`BIR_EIS_LIVE` gates a client that can't yet be certified). The mandate (RR 11-2025, extended to **Dec 31, 2026** by RR 26-2025) currently binds **Large Taxpayers + e-commerce (excluding micro)**. ([PwC](https://www.pwc.com/ph/en/tax/tax-publications/taxwise-or-otherwise/2025/paperles-invoicing-and-sales-reporting.html), [Sovos](https://sovos.com/regulatory-updates/vat/philippines-deadline-for-mandatory-structured-e-invoicing-extended/), [Grant Thornton PH](https://www.grantthornton.com.ph/insights/articles-and-updates1/lets-talk-tax/ready-or-not-philippines-shift-to-e-invoicing-and-electronic-sales-reporting/))

### 2.3 The pivot (locked this review)
**"Compliance Co-Pilot" — prepare → review → submit.** Axial maps each ledger-final event into a BIR-EIS-ready, JWS-signable payload and SSS/PhilHealth/Pag-IBIG schedules, surfaces them for **human review and one-click approval**, then submits (mock today; live once PTT-certified). The human checkpoint is *the* answer to "what if it's wrong or fraudulent." Auto-submission stays on the roadmap, explicitly gated on certification. Tagline shifts from *Invisible* → **Effortless** Compliance (final wording in the deck).

> This mirrors how serious tax-automation works: a clearance/approval boundary, not blind transmission. It is a strength to present, not a weakness to hide.

---

## 3. The regulatory exposure we were under-stating (PH-first)

### 3.1 Axial is, in substance, a financing activity
Under **RA 8556 (Financing Company Act of 1998)**, a financing company is one extending credit "**by factoring or discounting … accounts receivable**." That is precisely what Axial's advance does. Financing companies need SEC registration **and a separate Certificate of Authority (CA)**; lending is separately governed by **RA 9474**. ([RA 8556](https://www.bsp.gov.ph/Regulations/Banking%20Laws/RA8556.pdf), [CloudCfo](https://cloudcfo.ph/blog/compliance-for-lending-and-financing-companies-in-the-philippines/))

There is also a **transfer restriction**: factored/assigned receivables held by a financing company may be sold/assigned/transferred only to banks, NBFIs, financing/investment companies, insurers, GFIs, pension funds, etc. — **not to an open, anonymous on-chain pool.** This is the single biggest correction to our "DeFi liquidity pool" framing.

**Implication:** Axial v1 should present as **technology + origination rails that sit on top of a licensed financing entity / qualified liquidity partners** (PDAX's LP network, regulated funders), not as the lender of record to an open pool. Carlos to confirm Axial's own entity/CA posture with counsel.

### 3.2 The other regulatory edges
- **VASP/BSP:** custodial handling of USDC and the PHP fiat edge touch BSP VASP rules; mitigated by keeping fiat at the PDAX/anchor edge (Axial never custodies pesos) — but custodial *crypto* signing still needs a posture.
- **Data Privacy Act (RA 10173):** financial data + payer KYB + automated eligibility ⇒ **mandatory DPO + PIA**, 72-hour breach notification. Already flagged in [`clr-axial.md`](clr-axial.md) as a launch gate.
- **PPSA (Personal Property Security Act):** PH now recognizes receivables as movable collateral and runs a notice registry — useful *for us* (double-financing check) and a sign the legal rails for receivables finance exist.

### 3.3 USDC is not a dependency-free choice
Circle's USDC has **blacklist/freeze powers coded into the contract**; in March 2026 Circle froze 16 business wallets tied to an undisclosed US civil case, disrupting exchanges and processors. Circle has frozen ~$110M across <500 addresses historically. ([crypto.news](https://crypto.news/circles-16-wallet-usdc-freeze-revives-centralization-and-blacklist-debate/), [Circle risk factors](https://www.circle.com/legal/usdc-risk-factors)) Plus USDC is USD — the **PHP/USD FX risk** between advance and settlement is borne somewhere (today by the hardcoded 56.5 fallback). Both are managed risks to name, not hide.

---

## 4. The Philippine competitive reality (we are not first — that's fine)

| Player | What they do | What it means for us |
|---|---|---|
| **Acudeen** | Receivables-factoring marketplace (P2P invoice exchange); facilitated ~₱500M for 1,000+ SMEs; blockchain history | Proof the *demand* and the *model* are real in PH; differentiator is our **compliance + payroll integration on one rail**, not factoring alone |
| **First Circle** | SME working capital / invoice financing, short tenors | Established incumbent; competes on speed/collateral-free — we must beat them on all-in cost + the compliance bundle |
| **SeekCap × Investree, RCBC MSME fund** | Bank-fintech receivables financing partnerships | Shows the **regulated-partner model** (§3.1) is the norm here, validating our reframing |

([Acudeen/CoinGeek](https://coingeek.com/acudeen-extends-direly-needed-financial-services-msmes-philippines/), [First Circle](https://www.firstcircle.ph/blog/invoice-financing), [SeekCap/Investree](https://www.crowdfundinsider.com/2021/11/182581-seekcap-investree-philippines-partnership-to-provide-needed-sme-financing/))

**Positioning takeaway:** Axial's wedge is **not** "factoring on blockchain" (Acudeen-style). It is **"the one rail where liquidity and compliance are the same event"** — that's the defensible, non-obvious claim, and it's true to the architecture.

---

## 5. What was wrong (or weak) in our thesis — the honest list

1. **"Invisible Compliance" overpromised** on a regulated, liability-heavy process we haven't certified. → fixed via the Co-Pilot pivot.
2. **"No external dependency"** was wrong: USDC = Circle counterparty + freeze + FX risk. → name it.
3. **"DeFi/open liquidity pools fund MSMEs"** is regulatorily off in PH and contradicts RA 8556's transfer restriction. → reframe to regulated/qualified funders.
4. **Chicken-and-egg GTM under-acknowledged:** the closed loop needs the *enterprise payer* onboarded before the *small seller* can be funded. Onboarding big buyers is the hard, slow part — and we present it as a given. → name it as the deliberate wedge (start where the payer is already motivated) and a roadmap challenge.
5. **Liquidity sourcing is unsolved:** "PDAX's 20+ LP network" is aspirational, not contracted. → present as partnership pipeline, not fact.
6. **Custodial key risk:** server-held funder/MSME/issuer secrets are a single point of failure and a custody question. → roadmap to Freighter/MPC self-custody.
7. **Micro-invoice economics unproven:** KYB + legal + origination cost per ₱30k ticket may not pencil out yet. → lead with agency-sized invoices.
8. **Statutory tables + NoA need counsel sign-off** before they touch a real peso. → already a CLR launch gate; keep it visible.

None of these sink the thesis. They sharpen it. The product that survives this scrutiny is **narrower, more honest, and more defensible** — which is exactly what a PBW audience of operators and regulators will respect.

---

## 6. Implications for the PBW deck & script

- **Lead the risk story, don't bury it.** Add a dedicated "How we handle fraud & failure" beat: confirmed-invoice gate → NoA + lockbox → recourse + reserve → reconciliation auto-escalation → human compliance checkpoint.
- **Use Greensill/Goldfinch as the "winners and losers" proof** (5-element narrative #2): the platforms that skipped underwriting discipline failed; the change rewards the disciplined.
- **Reframe compliance** everywhere as *Effortless / Co-Pilot with a human in the loop*, never "invisible/automatic."
- **Reframe funders** as regulated/qualified partners.
- **Keep the hackathon win as evidence (#5), not the headline** — this is an industry talk now, not a hackathon pitch.
- **Be honest about what's live vs roadmap** — an audience that includes regulators will reward candor and punish overclaiming.
