# contractor_payroll (Track A — Testnet)

Pays **independent contractors** in USDC on Stellar.

## Rules

- Deploy and initialize on **Stellar Testnet** first.
- **Do not modify** Mainnet `payroll_split`.
- Regular **employees** are excluded (Labor Code Art. 102). Use Track B `FiatOfframp` for PHP wages.

## Contract API

| Method | Purpose |
|--------|---------|
| `initialize(admin, usdc)` | One-time setup |
| `quote_batch(wallets, amounts)` | Sum preview |
| `route_batch(payer, batch_id, wallets, amounts)` | Atomic multi-transfer; one route per `batch_id` |
| `get_batch(batch_id)` | Read record |

Max **25** payees per batch. Amounts must be `> 0`. Parallel `wallets` / `amounts` vectors must match length.

## Build / test (WSL)

```bash
cd /mnt/d/PROJECTS/axial/soroban
cargo test -p contractor_payroll
stellar contract build
# wasm: target/wasm32v1-none/release/contractor_payroll.wasm
```

## Deploy (Testnet only)

```bash
# After funding a Testnet identity — see Makefile / scripts
stellar contract deploy --wasm target/wasm32v1-none/release/contractor_payroll.wasm --network testnet ...
# Write CONTRACTOR_PAYROLL_CONTRACT_ID into web env (TESTNET_ prefix)
```

Plan: [`docs/plans/resilience-stablecoin-payroll/overview.md`](../../../docs/plans/resilience-stablecoin-payroll/overview.md) · Track A note: [`phase-07-track-a-testnet.md`](../../../docs/plans/resilience-stablecoin-payroll/phase-07-track-a-testnet.md).
