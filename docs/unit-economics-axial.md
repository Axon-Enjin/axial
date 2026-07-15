# Axial — Unit Economics

**Version:** 1.0  
**Date:** 2026-07-15  
**Status:** Planning model (not audited financials)  
**Foundation:** [`Axial.md`](Axial.md) §7.4 · [`gtm-axial.md`](gtm-axial.md) · [`research-pinkraft-axial.md`](research-pinkraft-axial.md)

> All figures are **working assumptions** for fundraising conversations. Replace with live partner rates before term sheets.

---

## 1. Two revenue engines

| Engine | Type | Who pays | Role |
|--------|------|----------|------|
| **A. Liquidity spread** | Transactional | Funded MSME (via discount) / shared with funder | Scales with financed volume |
| **B. Compliance SaaS** | Recurring | MSME org | Moat + retention when not factoring |

Tagline economics: **Instant Capital** monetizes float unlocked; **Effortless Compliance** monetizes regulatory urgency (BIR EIS Dec 2026).

---

## 2. Liquidity unit (per funded invoice)

### Assumptions (default model)

| Input | Value | Notes |
|-------|-------|-------|
| Face value | ₱100,000 | Typical agency milestone invoice |
| Advance rate | 85% | `DEFAULT_ADVANCE_BPS = 8500` |
| Advance | ₱85,000 | Paid in USDC (UI in PHP) |
| Holdback reserve | ₱15,000 | Released at settlement |
| Tenor | Net 60 (~2 months) | Or Net 90; price accordingly |
| All-in discount to MSME | 2.5% of face / ~30-day equivalent | Target below traditional PH factoring |
| Platform take | **1.0% of face** | Midpoint of 0.5–1.5% locked range |
| Funder yield | Remainder of discount | Risk capital return |
| Origination (sub-₱50k) | ₱150 flat | Optional micro-ticket fee |

### Worked example — ₱100k Net-60 invoice

| Line | Amount |
|------|--------|
| Face | ₱100,000 |
| Advance to MSME (85%) | ₱85,000 |
| Illustrative all-in discount (e.g. 6% of face for ~60 days) | ₱6,000 |
| Of which platform (~1% face) | **₱1,000** |
| Of which funder yield | ₱5,000 |
| At settlement: funder repaid advance | ₱85,000 |
| MSME reserve + residual | per contract rules |

**Contribution per funded peso (platform):** ≈ **₱0.01** at 1% take.

### Contribution margin sketch (platform only)

| | Per ₱100k invoice |
|--|-------------------|
| Platform revenue | ₱1,000 |
| Variable cost (RPC, hosting, FX edge, support alloc.) | ~₱150–300 |
| **Contribution** | ~₱700–850 |

On-chain gas on Stellar is negligible vs PHP economics.

---

## 3. Compliance SaaS unit (per org / month)

Illustrative tiers (finalize in pilot pricing):

| Tier | Monthly | Includes | Target |
|------|---------|----------|--------|
| Starter | ₱2,500 | EIS prep queue, statutory schedules, 1 org, ≤50 invoices/mo | Micro agencies |
| Growth | ₱7,500 | Higher volume, payroll router, priority support | 10–50 headcount |
| Scale | ₱20,000+ | Multi-entity, SLA, custom liquidity | Distributors / multi-brand |

**Gross margin target:** >80% after infra (software marginal cost is low; support is the limiter).

**Why it sticks:** Dec 2026 mandate makes EIS a must-have even in months with zero factoring.

---

## 4. Blended ARR scenarios (illustrative)

| Cohort | Orgs | Avg SaaS / mo | Funded face / mo / org | Platform 1% | Monthly revenue | Annual run-rate |
|--------|------|---------------|------------------------|-------------|-----------------|-----------------|
| Pilot | 10 | ₱5,000 | ₱500,000 | ₱5,000 | ₱100,000 | ₱1.2M |
| Early | 50 | ₱6,000 | ₱800,000 | ₱8,000 | ₱700,000 | ₱8.4M |
| Growth | 200 | ₱8,000 | ₱1,200,000 | ₱12,000 | ₱4,000,000 | ₱48M |

These are **planning ceilings**, not forecasts. Capital availability and payer onboarding dominate volume.

---

## 5. Cost stack (startup)

| Cost | Nature | Notes |
|------|--------|-------|
| Cloud Run + Supabase | Fixed + usage | Already in stack |
| Stellar / Soroban ops | Low variable | Mainnet fees tiny vs AR |
| Liquidity partner yield | Pass-through | Not Axial COGS if balance-sheet sits with partner |
| KYB / counsel / audit | Semi-fixed | Required before scale |
| Team | Fixed | 4 builders → expand GTM + compliance ops |

**Capital model preference:** Axial as **tech + origination rails** on a licensed financing entity — not as an unlicensed open pool (see feasibility + CLR).

---

## 6. Huma / duration caution

Huma-style PayFi often earns on **short-duration, high-recycle** capital (days, not Net 60–90). Axial’s receivables are longer:

| Strategy | Implication |
|----------|-------------|
| **Price duration** | Higher all-in discount on Net 90 vs Net 30 |
| **Recycle / pool** | Multiple advances against revolving facilities |
| **Holdback + recourse** | Protect funder yield from leakage |

Do not pitch Huma’s velocity APY without adjusting for tenor.

---

## 7. Unit economics health checks

| Metric | Healthy target |
|--------|----------------|
| Platform take / face | 0.5–1.5% |
| MSME all-in vs traditional factoring | Strictly lower + no collateral |
| SaaS gross margin | ≥80% |
| Leakage / shortfall rate | Track weekly; escalate via reconcile |
| Payback on CAC (pilot) | <6 months via SaaS + first advances |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-15 | Initial unit economics model for investor landing |
