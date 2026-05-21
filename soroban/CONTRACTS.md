# Soroban contract map (Axial)

Canonical product spec: `docs/sdd-axial.md` §4 · `docs/prd-axial.md` §3 · `docs/rfc-axial-closed-loop-settlement.md`

## On-chain (this workspace)

| Crate | SDD name | Responsibility | Hackathon priority |
|-------|----------|----------------|-------------------|
| `receivable_token` | SAC / receivable token | `initialize`, `mint`, `is_minted`, `get_receivable` — one mint per invoice (off-chain payer confirm + NoA) | **P0** — implemented |
| `axial_swap` | Atomic swap | USDC advance vs receivable token; denomination-agnostic asset param; reserve + discount | **P0** |
| `payroll_split` | Statutory payroll router | `initialize`, `quote`, `route_payroll`, `get_payroll` — USDC split to SSS / PhilHealth / Pag-IBIG + net to employees (demo bps) | **P1** — implemented |
| `settlement` *(optional)* | Settlement | Lockbox payment → repay funder, release reserve, margin to MSME | **P2** — merge into `axial_swap` if late |

WASM paths after `make build`:

```text
target/wasm32v1-none/release/receivable_token.wasm
target/wasm32v1-none/release/axial_swap.wasm
target/wasm32v1-none/release/payroll_split.wasm
```

## Off-chain (not in `soroban/`)

| Piece | Owner stream | Doc |
|-------|--------------|-----|
| Payer KYB, invoice confirm, NoA, funding gate | Backend API + DB | RFC CLS-01–05 |
| BIR EIS oracle, JWS, mock BIR, memo write-back | Backend worker | SDD §5, Axial.md L1 |
| Reconciliation / leakage | Scheduled worker | SDD §4 |

## Happy-path call order (demo)

```text
API gate (off-chain) → receivable_token::mint
  → axial_swap::execute
  → payroll_split::route (optional in same demo)
  → [later] settlement::settle on lockbox payment
  → oracle submits EIS + memo (off-chain)
```

## Examples to fork

- Token / SAC: [soroban-examples/token](https://github.com/stellar/soroban-examples/tree/main/token)
- Atomic swap: [soroban-examples/atomic_swap](https://github.com/stellar/soroban-examples/tree/main/atomic_swap)
- Allocations: [soroban-examples/alloc](https://github.com/stellar/soroban-examples) + token transfer patterns
