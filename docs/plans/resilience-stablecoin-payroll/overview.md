# Resilience, stablecoin payroll, and GTM realignment

**Status:** Shipped in repo (2026-07-17). Track A live on Testnet (`contractor_payroll` + `TESTNET_CONTRACTOR_PAYROLL_CONTRACT_ID`).  
**Locked:** Mainnet crates immutable · new crates Testnet-first · Track B = `FiatOfframp` mock until partner · ICP = export agencies first  
**Foundation:** [Axial.md](../../Axial.md) · [testing.md](testing.md)

## Why this existed

Happy path on Mainnet was real; chaos survival was not (silent T+3, FX/unit drift, shared lockbox, calm UX). Payroll in USDC needs Art. 102 split: contractors USDC (A) vs employees fiat (B).

## Shipped (phases folded)

| Area | Where |
|---|---|
| USDC units / pin `faceUsdc` / lockbox after submit | `web/lib/fx/convert.ts`, lockbox fund + `mark_collected` |
| EIS T+3 emit, stuck `submitted`, 24h escalate, Co-Pilot worker | `web/lib/eis/worker.ts`, notifications |
| Overview punch-list, hold-to-confirm, chain error map | `overview-exceptions`, `AdvanceConfirmPanel`, `format-chain-error` |
| `register_invoice` retry queue | `pending-registration` + `/api/settlement/register-retry` |
| Payroll stable ids / preflight / Freighter EIS | `payroll/build`, `tx/submit` |
| Off-system reversal UX | `OffSystemReversalPanel` |
| Track A Testnet crate + Compliance UI | `soroban/contracts/contractor_payroll`, `ContractorPayPanel` |
| Track B interface + mock quote | `fiat-offramp.ts`, `/api/payroll/offramp/quote` |
| GTM/ICP sync | `gtm-axial.md`, PRD, Axial §8.2 pointer |

## Still open (ops / partners)

- Live Track A pay: restart web with env; fund MSME Testnet USDC; route a batch
- Live Track B VASP / PDAX — when partner + counsel
- SMS/email escalate — in-app only today
- Per-invoice on-chain lockbox isolation — needs new Testnet crate, not Mainnet edit

## Constraints

| Rule |
|---|
| Do not edit Mainnet-deployed crates |
| New Soroban logic → Testnet first |
| Axial never custodies PHP |
| Escalate UI only at legal-risk thresholds |

## Verify

```bash
cd web && npm test
# Docker/WSL: cargo test -p contractor_payroll
```

Details: [testing.md](testing.md).
