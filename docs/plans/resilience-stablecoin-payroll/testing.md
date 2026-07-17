# Testing matrix

Back: [overview.md](overview.md)

| Phase | Automated | Manual / Testnet |
|---|---|---|
| 1 Units / FX / lockbox | Vitest preflight stroops; lockbox pin | Swap confirm PHP matches execute |
| 2 EIS | oracle.prepare + worker expire emit | Cron dry-run expire → bell |
| 3 UX | Punch-list unit on journey helpers | 5 exceptions → one strip; hold-to-confirm |
| 4 Register recovery | Enqueue/retry unit | Force register fail → recover |
| 5 Payroll harden | Stable id + submit EIS hook | Freighter payroll → EIS row |
| 6 Human ops | — | Reversal + fallback notify |
| 7 Track A | `cargo test` new crate | Testnet wallets credited |
| 8 Track B | Mock FiatOfframp unit | Demo Settings card only |

**Regression:** `cd web && npm test && npm run test:e2e` (guardrails).  
**Contracts:** `make test` must stay green; Mainnet wasm hashes unchanged.
