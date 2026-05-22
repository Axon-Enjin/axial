#!/usr/bin/env bash
# Deploy all 4 Axial Soroban contracts to Stellar mainnet (WSL / Linux).
# Run from soroban/:  sed -i 's/\r$//' scripts/deploy-mainnet.sh && ./scripts/deploy-mainnet.sh
#
# Prerequisites:
#   stellar keys add mainnet-wallet --secret-key   # Freighter export for deployer
#   Fund deployer with >= 10 XLM on mainnet
#   stellar contract build   (or make build)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SOURCE_KEY="${SOURCE_KEY:-mainnet-wallet}"
NETWORK="mainnet"
PASSPHRASE="Public Global Stellar Network ; September 2015"
RPC_URL="https://mainnet.sorobanrpc.com"
USDC_CONTRACT="CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75"
ADVANCE_BPS=8500
SSS_BPS=500
PHILHEALTH_BPS=300
PAGIBIG_BPS=200
WASM_DIR="$ROOT/target/wasm32v1-none/release"
OUTPUT_JSON="$ROOT/deployments/mainnet.json"

stellar_() {
  stellar "$@" 2>&1
}

deploy_contract() {
  local name="$1"
  local wasm="$WASM_DIR/${name}.wasm"
  echo ""
  echo "=== Deploy $name ==="
  if [[ ! -f "$wasm" ]]; then
    echo "ERROR: Missing $wasm — run 'stellar contract build' or 'make build' first"
    exit 1
  fi
  local id
  id=$(stellar contract deploy --wasm "$wasm" --source-account "$SOURCE_KEY" --network "$NETWORK" | tail -1)
  if [[ ! "$id" =~ ^C[A-Z0-9]{55}$ ]]; then
    echo "ERROR: Unexpected contract id: $id"
    exit 1
  fi
  echo "  $name → $id"
  echo "$id"
}

echo "Axial Mainnet Deploy (WSL)"
echo "Network : $NETWORK"
echo "Source  : $SOURCE_KEY"

ADMIN=$(stellar keys public-key "$SOURCE_KEY")
echo "Admin   : $ADMIN"
echo "USDC SAC: $USDC_CONTRACT"

for c in receivable_token axial_swap payroll_split settlement; do
  if [[ ! -f "$WASM_DIR/${c}.wasm" ]]; then
    echo "ERROR: Missing $WASM_DIR/${c}.wasm"
    exit 1
  fi
done

RECEIVABLE_ID=$(deploy_contract receivable_token)
SWAP_ID=$(deploy_contract axial_swap)
PAYROLL_ID=$(deploy_contract payroll_split)
SETTLEMENT_ID=$(deploy_contract settlement)

echo ""
echo "=== Initialize contracts ==="

stellar contract invoke --id "$RECEIVABLE_ID" --source-account "$SOURCE_KEY" --network "$NETWORK" \
  -- initialize --admin "$ADMIN" >/dev/null
echo "  receivable_token initialized"

stellar contract invoke --id "$SWAP_ID" --source-account "$SOURCE_KEY" --network "$NETWORK" \
  -- initialize --admin "$ADMIN" --usdc "$USDC_CONTRACT" --advance_bps "$ADVANCE_BPS" >/dev/null
echo "  axial_swap initialized (advance_bps=$ADVANCE_BPS)"

stellar contract invoke --id "$PAYROLL_ID" --source-account "$SOURCE_KEY" --network "$NETWORK" \
  -- initialize --admin "$ADMIN" --usdc "$USDC_CONTRACT" \
  --sss "$ADMIN" --philhealth "$ADMIN" --pagibig "$ADMIN" --employees "$ADMIN" \
  --sss_bps "$SSS_BPS" --philhealth_bps "$PHILHEALTH_BPS" --pagibig_bps "$PAGIBIG_BPS" >/dev/null
echo "  payroll_split initialized"

stellar contract invoke --id "$SETTLEMENT_ID" --source-account "$SOURCE_KEY" --network "$NETWORK" \
  -- initialize --admin "$ADMIN" --usdc "$USDC_CONTRACT" >/dev/null
echo "  settlement initialized"

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
mkdir -p "$(dirname "$OUTPUT_JSON")"
cat > "$OUTPUT_JSON" <<EOF
{
  "network": "mainnet",
  "passphrase": "$PASSPHRASE",
  "rpc": "$RPC_URL",
  "deployed_at": "$NOW",
  "roles": {
    "admin_key": "$SOURCE_KEY",
    "admin_public": "$ADMIN",
    "funder_key": "$SOURCE_KEY",
    "funder_public": "$ADMIN",
    "msme_key": "$SOURCE_KEY",
    "msme_public": "$ADMIN"
  },
  "contracts": {
    "axial_swap": "$SWAP_ID",
    "usdc_token": "$USDC_CONTRACT",
    "receivable_token": "$RECEIVABLE_ID",
    "payroll_split": "$PAYROLL_ID",
    "settlement": "$SETTLEMENT_ID"
  }
}
EOF

echo ""
echo "=== Wrote $OUTPUT_JSON ==="
echo "Next: ./scripts/mainnet-setup.sh"
