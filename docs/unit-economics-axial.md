# Axial — Unit Economics

**Version:** 1.1  
**Date:** 2026-07-17  
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

Telegram ops alerts and advisory EIS explain are **not** a third engine. They are conversion/retention multipliers on A and B.

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

Illustrative tiers (finalize in pilot pricing; GTM Pilot/Standard/Enterprise labels remain TBD until pilot closes):

| Tier | Monthly | Includes | Target |
|------|---------|----------|--------|
| Starter | ₱2,500 | EIS prep queue, statutory schedules, 1 org, ≤50 invoices/mo | Micro agencies |
| Growth | ₱7,500 | Higher volume, payroll router, priority support | 10–50 headcount |
| Scale | ₱20,000+ | Multi-entity, SLA, custom liquidity | Distributors / multi-brand |

**Gross margin target:** >80% after infra (software marginal cost is low; support is the limiter).

**Why it sticks:** Dec 2026 mandate makes EIS a must-have even in months with zero factoring.

---

## 4. Feature unit P&L (attribution)

| Feature | Primary engine | Revenue attribution | COGS / risk | Notes |
|---------|----------------|---------------------|-------------|-------|
| Atomic swap / advance | A | 0.5–1.5% of funded face | FX convert, RPC, support, leakage share | Code advances at 85%; **platform take not deducted yet** |
| Payroll split | B (Growth+) | Bundled in SaaS | Contract invoke + support | Statutory bps are SSS/PhilHealth/Pag-IBIG, not Axial fees |
| EIS Co-Pilot | B | Core of Starter+ | Oracle, JWS, worker, support | Billing absent; sticky with zero advances |
| Rule-based / optional LLM explain | B | Retention / Scale upsell candidate | LLM token cost if enabled | Advisory only; see [`rfc-axial-eis-explain.md`](rfc-axial-eis-explain.md) |
| NoA + settlement lockbox | Enables A | Indirect (unlocks volume) | Leakage ops | Without NoA ack, financed volume stays near zero |
| Payer portal | Enables A | Indirect | Support | Chicken-and-egg GTM gate |
| Telegram MSME ops | A+B multiplier | Retention + faster Approve / quote | Bot API free; support if chatty | Not an acquisition channel in [`gtm-axial.md`](gtm-axial.md) |

---

## 5. Sensitivity (platform only, ₱100k face)

Hold other inputs at the §2 midpoint. Change one lever:

| Lever | Low | Mid | High | Platform revenue / invoice |
|-------|-----|-----|------|----------------------------|
| Take rate | 0.5% | 1.0% | 1.5% | ₱500 / ₱1,000 / ₱1,500 |
| Tenor discount (all-in) | 3% Net-30-ish | 6% Net-60 | 9% Net-90 | Pie grows; Axial still takes band of face, funder takes residual |
| Leakage on book | 0% | 1% | 2% | Eats funder yield first; damages renewals more than take |
| FX markup | 0% (today) | 0.25% | 0.5% | Docs name “thin FX spread”; **code has 0% markup** |
| Telegram → Approve conversion | — | +10% of prepared filings approved in-window | +25% | Lifts SaaS trust + unlocks more Engine A volume |

Contribution after ~₱200 variable cost: **₱300 / ₱800 / ₱1,300** across the take-rate row.

---

## 6. Blended ARR scenarios (illustrative)

| Cohort | Orgs | Avg SaaS / mo | Funded face / mo / org | Platform 1% | Monthly revenue | Annual run-rate |
|--------|------|---------------|------------------------|-------------|-----------------|-----------------|
| Pilot | 10 | ₱5,000 | ₱500,000 | ₱5,000 | ₱100,000 | ₱1.2M |
| Early | 50 | ₱6,000 | ₱800,000 | ₱8,000 | ₱700,000 | ₱8.4M |
| Growth | 200 | ₱8,000 | ₱1,200,000 | ₱12,000 | ₱4,000,000 | ₱48M |

These are **planning ceilings**, not forecasts. Capital availability and payer onboarding dominate volume.

---

## 7. Cost stack (startup)

| Cost | Nature | Notes |
|------|--------|-------|
| Cloud Run + Supabase | Fixed + usage | Already in stack |
| Stellar / Soroban ops | Low variable | Mainnet fees tiny vs AR |
| Liquidity partner yield | Pass-through | Not Axial COGS if balance-sheet sits with partner |
| KYB / counsel / audit | Semi-fixed | Required before scale |
| Team | Fixed | 4 builders → expand GTM + compliance ops |
| Optional EIS LLM explain | Variable | Only if `EIS_EXPLAIN_LLM=true` |

**Capital model preference:** Axial as **tech + origination rails** on a licensed financing entity — not as an unlicensed open pool (see feasibility + CLR).

---

## 8. Doc ↔ code gap (fee capture)

| Mechanism | Documented | Implemented in product code |
|-----------|------------|-----------------------------|
| `advance_bps` 85% | Yes | Yes (`web/lib/soroban/quote.ts`, `axial_swap`) |
| Platform take 0.5–1.5% | Yes | **No** — not deducted in swap/settlement |
| Micro origination ₱150 | Yes | **No** |
| FX markup | Named | **No** — Reflector + 56.5 fallback, pass-through |
| SaaS billing / entitlements | Tier table | **No** subscription metering |
| Payroll platform fee | Bundled in SaaS | On-chain split only |
| ToS / fee schedule | CLR flags needed | Legal gap before live fee capture |

Ship fee capture only after ToS + partner term sheets. Until then, treat §2–§6 as fundraising math, not ledger truth.

---

## 9. Huma / duration caution

Huma-style PayFi often earns on **short-duration, high-recycle** capital (days, not Net 60–90). Axial’s receivables are longer:

| Strategy | Implication |
|----------|-------------|
| **Price duration** | Higher all-in discount on Net 90 vs Net 30 |
| **Recycle / pool** | Multiple advances against revolving facilities |
| **Holdback + recourse** | Protect funder yield from leakage |

Do not pitch Huma’s velocity APY without adjusting for tenor.

---

## 10. Unit economics health checks

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
| 2026-07-17 | Feature P&L, sensitivity table, doc↔code fee gap; Telegram/explain as multipliers |
