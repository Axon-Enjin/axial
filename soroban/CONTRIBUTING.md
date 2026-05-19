# Soroban — team setup (collaborators)

Everyone builds contracts in **WSL** with the Stellar CLI. Keys stay on each developer’s machine — **never commit seeds or `.env`**.

## Quick start (new collaborator)

```bash
export AXIAL_ROOT=/mnt/c/Users/User/CODERIST/axonjn/axial   # adjust path
cd "$AXIAL_ROOT/soroban"
./scripts/setup-dev.sh
```

Then:

```bash
make build
make test
# deploy when ready (uses STELLAR_SOURCE from .env)
make deploy-axial_swap
```

## Do you have testnet?

The CLI ships with a `testnet` network alias. Verify:

```bash
stellar network ls          # must list testnet
stellar keys ls             # your identity names
./scripts/check-testnet.sh  # public addresses + friendbot fund if empty
```

Fund your **personal** test identity:

```bash
stellar keys generate yourname-axial --network testnet
stellar keys fund yourname-axial --network testnet
```

Friendbot gives test XLM on **Test SDF Network** only.

## What each person owns vs what the team shares

| Item | Per developer | Shared in repo |
|------|----------------|----------------|
| Secret key / seed | `~/.config/stellar/identity/*` | **Never** |
| `soroban/.env` | Your `STELLAR_SOURCE=` | **Never** (use `.env.example`) |
| RPC / network | `stellar network` config | Documented in README |
| Contract IDs after deploy | Paste into `.env` | Optional: `deployments/testnet.json` (team private repo) |
| WASM / Rust source | — | `soroban/contracts/*` |

## Recommended demo identities (optional naming)

For scripted demos, agree on roles — still **one key per person** in production; for hackathon you may reuse role names locally:

| Role | Suggested key name | Purpose |
|------|-------------------|---------|
| Deployer / dev | `yourname-axial` | Build, deploy, invoke |
| MSME demo | `msme-demo` | Receives swap proceeds |
| Funder / treasury | `treasury-demo` | Provides USDC in swap demo |
| Payer (debtor) | `payer-demo` | Lockbox payer (later) |

Existing machine keys (`admin-key`, `my-key`, `treasury-key`) are fine — set `STELLAR_SOURCE=admin-key` in `.env`.

## After deploy — share contract IDs

1. Deployer runs `make deploy-all` (or per-crate targets).
2. Copy CLI output contract IDs into `deployments/testnet.json`:

```json
{
  "contracts": {
    "receivable_token": "C…",
    "axial_swap": "C…",
    "payroll_split": "C…"
  }
}
```

3. Others pull git, copy IDs into their `soroban/.env`, or run backend against `deployments/testnet.json`.

## Makefile / env

```bash
cp .env.example .env
# edit STELLAR_SOURCE=admin-key   (or your key name)
make deploy-axial_swap
```

`SOURCE` and `NETWORK` can be overridden:

```bash
SOURCE=treasury-key NETWORK=testnet make deploy-all
```

## Testnet USDC

Test XLM ≠ USDC. For swap demos use [Circle testnet faucet](https://faucet.circle.com/) or testnet USDC issuer docs; trustline may be required on your demo accounts.

## Mainnet

- New identity: `stellar keys generate yourname-axial-main --network mainnet`
- Fund with real XLM (no friendbot)
- Deploy only after testnet E2E — see README.md

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `stellar` not found | Use WSL, not PowerShell |
| `axial-deployer` missing | Use your key in `.env`; README default is only an example |
| Permission errors on `/mnt/c` | `chmod +x scripts/*.sh` or run `bash scripts/setup-dev.sh` |
| Crate download timeout | Retry `make build`; clone repo under `~/projects/axial` in WSL |
