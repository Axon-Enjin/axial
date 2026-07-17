# Track A — contractor USDC (Testnet)

Back: [overview.md](overview.md)

**Status:** Deployed + initialized on Testnet. Set `TESTNET_CONTRACTOR_PAYROLL_CONTRACT_ID` in `web/.env` (local). Contract id lives in gitignored `soroban/deployments/testnet.json` → `contracts.contractor_payroll`.

| Piece | Path |
|---|---|
| Crate | `soroban/contracts/contractor_payroll` |
| UI | `ContractorPayPanel` (Compliance) |
| API | `/api/payroll/contractors/{quote,build}` |

Legal: contractors only — not employees (Art. 102). Counsel watermark before production.

Verify: `cargo test -p contractor_payroll` · Compliance → Pay contractors after env reload.
