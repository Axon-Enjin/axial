# Axial — Soroban contracts

Smart contracts for the Axial hackathon build. **Build and deploy from WSL** (Stellar CLI + Rust live there; the repo is on the Windows drive).

## Team setup (collaborators)

**First time on the repo:** read [`CONTRIBUTING.md`](CONTRIBUTING.md), then:

```bash
cd "$AXIAL_ROOT/soroban"
make setup          # network + .env + fund your test identity
make check-testnet  # verify keys and testnet XLM
```

Each developer uses **their own** `STELLAR_SOURCE` in `soroban/.env` (from `.env.example`). Share deployed contract IDs via `deployments/testnet.json` (gitignored) or team chat.

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
│   └── payroll_split/        # SSS / PhilHealth / Pag-IBIG routing
└── target/                   # gitignored — *.wasm after build
```

Optional later: `stellar contract init . --name settlement` for lockbox payout (or merge into `axial_swap`).

## Locked network constants (from `docs/Axial.md`)

| Item | Value |
|------|--------|
| Settlement asset | **USDC on Stellar** |
| USDC issuer (Mainnet) | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| User-facing denomination | PHP (UI only) |

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
```

## Deploy (testnet)

```bash
cd "$AXIAL_ROOT/soroban"

WASM=target/wasm32v1-none/release/axial_swap.wasm
SOURCE=axial-deployer
NETWORK=testnet

# Upload + install + deploy (CLI prints contract ID)
stellar contract deploy \
  --wasm "$WASM" \
  --source "$SOURCE" \
  --network "$NETWORK"

# Save the returned contract ID, then invoke (scaffold hello)
CONTRACT_ID=<paste_contract_id>

stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- \
  hello \
  --to Axial
```

## Deploy (mainnet)

**Only after testnet E2E works.** Mainnet uses real XLM for fees.

```bash
# Fund deployer with Mainnet XLM (no friendbot) — use your funded account or:
# stellar keys generate axial-deployer-main --network mainnet

stellar contract deploy \
  --wasm target/wasm32v1-none/release/axial_swap.wasm \
  --source axial-deployer-main \
  --network mainnet
```

Establish a USDC trustline on the demo account before swap demos:

```bash
# USDC asset code + issuer (Mainnet)
stellar tx new change-trust \
  --source axial-deployer-main \
  --network mainnet \
  --asset USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
# … sign and submit per `stellar tx` help
```

See [Circle testnet USDC faucet](https://faucet.circle.com/) for test USDC where applicable.

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
2. **`axial_swap`** — USDC swap vs receivable token (fork `soroban-examples/atomic_swap`).
3. **`payroll_split`** — statutory splits to agency addresses.
4. **Backend** — EIS oracle + mock BIR + memo (not a Soroban crate).
5. Wire contract IDs into `web/` env — **never commit secret keys**.

Deploy all three to testnet: `make deploy-all` (after keys are funded).

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
