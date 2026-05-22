# Axial — Soroban contracts

Smart contracts for the Axial hackathon build. **Build and deploy from WSL** (Stellar CLI + Rust live there; the repo is on the Windows drive).

**Operating network:** Axial runs on **Stellar Mainnet** — this directory is the build/deploy workspace. Testnet remains a **developer sandbox** for local iteration only.

## Team setup (collaborators)

**First time on the repo:** read [`CONTRIBUTING.md`](CONTRIBUTING.md), then:

```bash
cd "$AXIAL_ROOT/soroban"
make setup          # network + .env + fund your test identity (testnet sandbox)
make check-testnet  # verify keys and testnet XLM
```

Each developer uses **their own** `STELLAR_SOURCE` in `soroban/.env` (from `.env.example`). The sandbox uses `deployments/testnet.json` (gitignored); the operating network uses `deployments/mainnet.json` (also gitignored). Share IDs via team chat or your private deploy artifacts — never commit secrets.

## Prerequisites (WSL)

```bash
stellar version   # e.g. 25.x with `stellar contract` subcommands
rustc --version   # 1.74+ (1.94+ recommended)
```

Repo path in WSL:

```bash
export AXIAL_ROOT=/mnt/c/Users/User/CODERIST/axonjn/axial
cd "$AXIAL_ROOT/soroban"
```

> **Tip:** First `cargo`/`stellar contract build` downloads ~200 crates. If downloads time out on `/mnt/c`, retry on a stable connection or clone the repo under `~/projects/axial` in WSL for faster I/O.

## Project layout

The repo folder is **`soroban/`** (workspace root). Stellar CLI puts each contract crate under **`soroban/contracts/`**:

```text
soroban/
├── CONTRACTS.md              # doc → crate map (read this first)
├── Cargo.toml
├── Makefile                  # build, test, deploy-* targets
├── contracts/
│   ├── receivable_token/     # SAC mint (payer-confirmed receivable)
│   ├── axial_swap/           # USDC atomic swap + reserve
│   ├── payroll_split/        # SSS / PhilHealth / Pag-IBIG routing
│   └── settlement/           # lockbox payout (P2 — optional for L1 demo)
├── deployments/
│   ├── testnet.json          # gitignored — team shares contract IDs
│   └── mainnet.json          # gitignored — after mainnet deploy
├── scripts/
│   ├── testnet-demo-setup.sh   # one-shot testnet E2E + web/.env.local
│   ├── mainnet-setup.sh        # sync mainnet env + GCP + GitHub (WSL)
│   ├── deploy-mainnet.sh       # deploy + init all 4 contracts on mainnet
│   └── import-mainnet-deployer.sh
└── target/                   # gitignored — *.wasm after build
```

## Locked network constants (from `docs/Axial.md`)

| Item | Value |
|------|--------|
| Settlement asset | **USDC on Stellar** |
| USDC issuer (Mainnet) | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| USDC SAC contract (Mainnet) | `CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75` |
| User-facing denomination | PHP (UI only) |
| Mainnet deploy (operating network) | **All 4 contracts** (receivable, swap, payroll, settlement) — see `deployments/mainnet.json` |
| Testnet sandbox | **All 4 contracts** (receivable, swap, payroll, settlement) — settlement Testnet deploy completed 2026-05-22; see `docs/sprint.md` B-2 |

## One-time CLI setup

Run in WSL from `soroban/`:

```bash
# Testnet (Soroban)
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Mainnet (Soroban) — deploy only after testnet happy path
stellar network add mainnet \
  --rpc-url https://mainnet.sorobanrpc.com \
  --network-passphrase "Public Global Stellar Network ; September 2015"

# Personal test identity (one per developer — never commit the seed file)
stellar keys generate yourname-axial --network testnet
stellar keys fund yourname-axial --network testnet
# Set STELLAR_SOURCE=yourname-axial in soroban/.env
```

Or use existing keys (e.g. `admin-key`) and set `STELLAR_SOURCE=admin-key` in `.env`.

## Build & test

```bash
cd "$AXIAL_ROOT/soroban"

# Build all workspace contracts → WASM under target/wasm32v1-none/release/
make build

# Unit tests (host environment)
make test

# Format
make fmt
```

Equivalent without Make:

```bash
stellar contract build
cargo test
```

Expected WASM artifacts after `make build`:

```text
target/wasm32v1-none/release/receivable_token.wasm
target/wasm32v1-none/release/axial_swap.wasm
target/wasm32v1-none/release/payroll_split.wasm
target/wasm32v1-none/release/settlement.wasm
```

**Fast path (recommended):** see [`TESTNET.md`](TESTNET.md) — `./scripts/testnet-demo-setup.sh` deploys all contracts, funds keys, and writes `deployments/testnet.json` + `web/.env.local`.

## Deploy (testnet — developer sandbox)

For local iteration only — the operating deploy target is Mainnet (see below).

```bash
cd "$AXIAL_ROOT/soroban"

WASM=target/wasm32v1-none/release/axial_swap.wasm
SOURCE=admin-key
NETWORK=testnet

# Upload + install + deploy (CLI prints contract ID)
stellar contract deploy \
  --wasm "$WASM" \
  --source "$SOURCE" \
  --network "$NETWORK"

# Save the returned contract ID, then initialize (once per deploy)
CONTRACT_ID=<paste_contract_id>
USDC_TOKEN_ID=<sac_or_test_token_contract_id>
ADMIN=$(stellar keys address "$SOURCE")

stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- \
  initialize \
  --admin "$ADMIN" \
  --usdc "$USDC_TOKEN_ID" \
  --advance_bps 8500

# Execute advance (funder must hold USDC on the token contract)
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- \
  execute_advance \
  --funder "$ADMIN" \
  --msme <msme_stellar_address> \
  --invoice_id INV-2023-8901 \
  --face_amount 100000
```

### receivable_token (mint before swap)

```bash
RECV_WASM=target/wasm32v1-none/release/receivable_token.wasm
stellar contract deploy --wasm "$RECV_WASM" --source-account admin-key --network testnet
# → RECEIVABLE_ID

stellar contract invoke --id "$RECEIVABLE_ID" --source-account admin-key --network testnet -- \
  initialize --admin "$(stellar keys address admin-key)"

stellar contract invoke --id "$RECEIVABLE_ID" --source-account admin-key --network testnet -- \
  mint \
  --issuer "$(stellar keys address admin-key)" \
  --msme GBCVJCRULTHI74CXNP4QFGE6OSK5XFUYIPPEONRNXS3JQSKA26TDAR66 \
  --invoice_id INV-REC-001 \
  --face_amount 250000

stellar contract invoke --id "$RECEIVABLE_ID" --source-account admin-key --network testnet --send=no -- \
  is_minted --invoice_id INV-REC-001

stellar contract invoke --id "$RECEIVABLE_ID" --source-account admin-key --network testnet --send=no -- \
  get_receivable --invoice_id INV-REC-001
```

### payroll_split (after swap — route payroll from MSME wallet)

Demo rates: SSS 11%, PhilHealth 5%, Pag-IBIG 2%, net 82% (hackathon placeholders — not legal tables).

```bash
PAYROLL_WASM=target/wasm32v1-none/release/payroll_split.wasm
stellar contract deploy --wasm "$PAYROLL_WASM" --source-account admin-key --network testnet
# → PAYROLL_ID

USDC_ID=CDECR6Z4KYGUHCJG3IBQSCLUN3NZQGUXCZRQLPAWBZ7GFN4I5ZBUDODS
MSME=GBCVJCRULTHI74CXNP4QFGE6OSK5XFUYIPPEONRNXS3JQSKA26TDAR66

stellar contract invoke --id "$PAYROLL_ID" --source-account admin-key --network testnet -- \
  initialize \
  --admin "$(stellar keys address admin-key)" \
  --usdc "$USDC_ID" \
  --sss "$(stellar keys address treasury-key)" \
  --philhealth "$(stellar keys address treasury-key)" \
  --pagibig "$(stellar keys address treasury-key)" \
  --employees "$MSME" \
  --sss_bps 1100 --philhealth_bps 500 --pagibig_bps 200

stellar contract invoke --id "$PAYROLL_ID" --source-account my-key --network testnet --send=yes -- \
  route_payroll --payer "$MSME" --payroll_id PAY-2026-04-01 --gross_amount 100000
```

## Deploy (mainnet)

This is the **operating** deploy target. **Only after testnet E2E works.** Mainnet uses **real XLM** (fees + reserves) and **real USDC** for swaps.

### Cost & funding (hackathon)

Organizers typically fund **~10 XLM** on one deployer account for deploy + init fees.

**One Mainnet account can deploy and run all L1 contracts** if you use it as `mainnet-wallet` (admin + funder + MSME in `deploy-mainnet.sh`). Import Freighter’s secret into CLI:

```bash
stellar keys add mainnet-wallet --secret-key   # paste S... once; never commit
```

### WSL one-command setup (Stellar CLI lives in WSL only)

```bash
cd soroban
sed -i 's/\r$//' scripts/*.sh
./scripts/mainnet-setup.sh          # sync env + GCP + GitHub vars file
./scripts/mainnet-setup.sh --deploy # fresh deploy + sync
```

See [docs/mainnet-wsl.md](../docs/mainnet-wsl.md). PowerShell is **not** used for Stellar — only your existing GitHub/Cloud Run deploy workflow.

**L1 demo minimum:** receivable + swap + payroll. Settlement is deployed on both Mainnet and Testnet; the open workstream is the in-app wiring (`register_invoice` / `settle`) tracked in `docs/sprint.md` B-2 phases S3–S6.

### Wire into Cloud Run / web

1. GitHub **Variables**: `./scripts/apply-github-mainnet-vars.sh` (or `print-github-mainnet-vars.sh`).
2. **GCP secrets**: uploaded by `mainnet-setup.sh` when `gcloud` is available (WSL or Windows).
3. App: **Freighter → Mainnet → Connect**, then **Settings → Stellar network → Mainnet**.

> **Freighter:** XLM in Freighter only pays txs **that Freighter (or that same `G...` secret on the server) signs**. It does not fund mint/swap on Cloud Run unless GCP secrets match that account.

### USDC on Mainnet (for swap demo)

Use **Circle USDC on Stellar** — SAC `CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75` (not the testnet token from `testnet.json`).

Establish a trustline on the **funder** account, then hold a small USDC balance for one demo swap:

```bash
stellar tx new change-trust \
  --source mainnet-wallet \
  --network mainnet \
  --asset USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
# sign and submit per `stellar tx` help
```

Test USDC only: [Circle faucet](https://faucet.circle.com/) works on **testnet**, not Mainnet.

## Inspect & bindings

```bash
# Contract metadata
stellar contract info --id "$CONTRACT_ID" --network testnet

# TypeScript bindings for web/ integration (optional)
stellar contract bindings typescript \
  --id "$CONTRACT_ID" \
  --network testnet \
  --output-dir ../web/lib/soroban/axial_swap
```

## Hackathon implementation order

See **`CONTRACTS.md`** for the full on-chain vs off-chain split.

1. **`receivable_token`** — SAC mint after API funding gate (fork `soroban-examples/token`).
2. **`axial_swap`** — USDC advance to MSME at configurable bps (85% default); `execute_advance` + `quote` implemented.
3. **`payroll_split`** — `quote` + `route_payroll` to agency addresses + employee pool (implemented).
4. **Backend** — EIS oracle + mock BIR + memo (not a Soroban crate).
5. Wire contract IDs into `web/` env — **never commit secret keys**. The app reads `MAINNET_`-prefixed env vars (see `web/.env.example`).

For the **testnet sandbox**: deploy all four WASMs with `make deploy-all` (set `STELLAR_SOURCE` + `STELLAR_NETWORK=testnet` in `.env`; fund keys first). Share IDs via `deployments/testnet.json` or run `make testnet-demo` for a full team bootstrap.

For the **operating network**: use `./scripts/deploy-mainnet.sh` or `./scripts/mainnet-setup.sh --deploy` (see Mainnet section above).

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `cargo` download timeouts | Retry `make build`; use WSL home dir clone; check VPN/firewall |
| `stellar` not found in PowerShell | Use WSL terminal — CLI is not on Windows PATH |
| Slow compiles on `/mnt/c` | Normal; prefer `~/projects/axial` for heavy Rust work |
| Wrong network | `stellar network ls` and `stellar keys ls` |

## References

- [Soroban overview](https://developers.stellar.org/docs/build/smart-contracts/overview)
- [soroban-examples](https://github.com/stellar/soroban-examples)
- Product spec: `docs/Axial.md`, SDD: `docs/sdd-axial.md`
