#!/usr/bin/env bash
# One-time initialize for contracts already listed in deployments/mainnet.json.
# Run when mint/swap returns "Receivable contract is not initialized" (Contract error #1).
#
#   cd soroban
#   sed -i 's/\r$//' scripts/initialize-mainnet.sh
#   ADMIN_STELLAR_KEY=mainnet-deployer ./scripts/initialize-mainnet.sh
#
# Requires: stellar CLI, deployer identity matching admin_public in mainnet.json,
#           deployer funded with XLM on mainnet.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DEPLOY_JSON="${DEPLOY_JSON:-$ROOT/deployments/mainnet.json}"
SOURCE_KEY="${ADMIN_STELLAR_KEY:-${SOURCE_KEY:-mainnet-deployer}}"
NETWORK="mainnet"
RPC_URL="https://mainnet.sorobanrpc.com"
PASSPHRASE="Public Global Stellar Network ; September 2015"
USDC_CONTRACT="CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75"
ADVANCE_BPS=8500
SSS_BPS=500
PHILHEALTH_BPS=300
PAGIBIG_BPS=200

json_field() {
  grep -oE "\"$1\": \"[^\"]+\"" "$DEPLOY_JSON" 2>/dev/null | head -1 | cut -d'"' -f4 || true
}

if [[ ! -f "$DEPLOY_JSON" ]]; then
  echo "ERROR: Missing $DEPLOY_JSON"
  exit 1
fi

RECEIVABLE_ID=$(json_field receivable_token)
SWAP_ID=$(json_field axial_swap)
PAYROLL_ID=$(json_field payroll_split)
SETTLEMENT_ID=$(json_field settlement)
EXPECTED_ADMIN=$(json_field admin_public)

if [[ -z "$RECEIVABLE_ID" || -z "$SWAP_ID" ]]; then
  echo "ERROR: mainnet.json missing contract IDs"
  exit 1
fi

if ! command -v stellar >/dev/null 2>&1; then
  echo "ERROR: Install Stellar CLI in WSL"
  exit 1
fi

if ! stellar network ls 2>/dev/null | grep -qx mainnet; then
  echo "==> Registering mainnet network"
  stellar network add mainnet --rpc-url "$RPC_URL" --network-passphrase "$PASSPHRASE"
else
  stellar network rm mainnet 2>/dev/null || true
  stellar network add mainnet --rpc-url "$RPC_URL" --network-passphrase "$PASSPHRASE"
fi

ADMIN=$(stellar keys public-key "$SOURCE_KEY" 2>/dev/null || true)
if [[ -z "$ADMIN" ]]; then
  echo "ERROR: Identity '$SOURCE_KEY' not found. Run: ./scripts/import-mainnet-deployer.sh"
  exit 1
fi

if [[ -n "$EXPECTED_ADMIN" && "$ADMIN" != "$EXPECTED_ADMIN" ]]; then
  echo "ERROR: $SOURCE_KEY is $ADMIN but mainnet.json admin is $EXPECTED_ADMIN"
  exit 1
fi

invoke_init() {
  local label="$1"
  local id="$2"
  shift 2
  echo ""
  echo "=== $label ($id) ==="
  set +e
  local out
  out=$(stellar contract invoke --id "$id" --source-account "$SOURCE_KEY" \
    --network "$NETWORK" --rpc-url "$RPC_URL" --network-passphrase "$PASSPHRASE" \
    -- "$@" 2>&1)
  local code=$?
  set -e
  if [[ $code -eq 0 ]]; then
    echo "  OK"
    return 0
  fi
  if echo "$out" | grep -qiE 'AlreadyInitialized|already initialized'; then
    echo "  Already initialized — skipping"
    return 0
  fi
  echo "$out"
  echo "  FAILED (exit $code)"
  return 1
}

echo "Axial mainnet initialize"
echo "Admin : $ADMIN"
echo "Source: $SOURCE_KEY"

FAILED=0

invoke_init receivable_token "$RECEIVABLE_ID" \
  initialize --admin "$ADMIN" || FAILED=1

invoke_init axial_swap "$SWAP_ID" \
  initialize --admin "$ADMIN" --usdc "$USDC_CONTRACT" --advance_bps "$ADVANCE_BPS" || FAILED=1

invoke_init payroll_split "$PAYROLL_ID" \
  initialize --admin "$ADMIN" --usdc "$USDC_CONTRACT" \
  --sss "$ADMIN" --philhealth "$ADMIN" --pagibig "$ADMIN" --employees "$ADMIN" \
  --sss_bps "$SSS_BPS" --philhealth_bps "$PHILHEALTH_BPS" --pagibig_bps "$PAGIBIG_BPS" || FAILED=1

if [[ -n "$SETTLEMENT_ID" ]]; then
  invoke_init settlement "$SETTLEMENT_ID" \
    initialize --admin "$ADMIN" --usdc "$USDC_CONTRACT" || FAILED=1
fi

echo ""
if [[ $FAILED -eq 0 ]]; then
  echo "==> All contracts initialized. Retry tokenize & swap in the app."
else
  echo "==> Some initializations failed — check output above."
  exit 1
fi
