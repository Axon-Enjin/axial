# S0-6 — Demo dry-run sign-off

**Date:** 2026-07-15  
**Network:** Stellar Mainnet  
**Status:** Checklist ready — operator records video after ≥3 clean runs

## Prerequisites

- `web/.env.local` with Mainnet secrets + Supabase (or file fallback)
- Funder wallet funded (XLM + USDC trustline)
- Freighter optional for payer lockbox path

## Dry-run matrix (run ≥3 times)

| Run | Mint tx | Swap tx | EIS row | Payroll tx | Settle tx | Repaid in funder book |
|-----|---------|---------|---------|------------|-----------|----------------------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |

Use [`settle-dry-run-checklist.md`](settle-dry-run-checklist.md) for the closed-loop path (payer confirm → NoA → lockbox → `settle`).

## Demo shot list (recording order)

1. **Landing** — `/` · tagline · "Launch demo"
2. **Overview** — `/app` · EIS pulse · treasury · Mainnet badge
3. **Settings** — Trust & Boundary ack · org TIN (if configured)
4. **Liquidity** — upload/seed invoice · confirm payer · Tokenize & Swap · funder book section
5. **Compliance** — EIS row · 20 fields · JWS preview · memo link
6. **Payroll** — quote · route · Compliance feed update
7. **Payer portal** — confirm or dispute · NoA ack · Freighter lockbox (optional)
8. **Funder portal** — token link · deal drawer · recourse status
9. **Overview** — notifications bell · deals at risk chip

## Sign-off

| Role | Name | Date | Notes |
|------|------|------|-------|
| Eng | | | ≥3 dry runs without blocking errors |
| Demo | | | Recording stored (fallback for live pitch) |

**Claim in pitch:** closed-loop on Mainnet with mock BIR/KYB — not live regulatory submission.
