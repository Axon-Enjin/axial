#!/usr/bin/env bash
# Print GitHub Actions MAINNET_* variables from deployments/mainnet.json (stdout only).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_JSON="$ROOT/deployments/mainnet.json"
MSME_OVERRIDE="${MSME_FREIGHTER_PUBLIC:-}"

if [[ ! -f "$DEPLOY_JSON" ]]; then
  echo "ERROR: Missing $DEPLOY_JSON" >&2
  exit 1
fi

json_field() {
  grep -oE "\"$1\": \"[^\"]+\"" "$DEPLOY_JSON" | head -1 | cut -d'"' -f4
}

MSME_G="${MSME_OVERRIDE:-$(json_field msme_public)}"

echo "MAINNET_SOROBAN_RPC_URL=$(json_field rpc | sed 's|/$||')"
echo "MAINNET_STELLAR_NETWORK_PASSPHRASE=$(json_field passphrase)"
echo "MAINNET_AXIAL_SWAP_CONTRACT_ID=$(json_field axial_swap)"
echo "MAINNET_RECEIVABLE_TOKEN_CONTRACT_ID=$(json_field receivable_token)"
echo "MAINNET_PAYROLL_SPLIT_CONTRACT_ID=$(json_field payroll_split)"
echo "MAINNET_SETTLEMENT_CONTRACT_ID=$(json_field settlement)"
echo "MAINNET_SOROBAN_USDC_TOKEN_ID=$(json_field usdc_token)"
echo "MAINNET_STELLAR_ISSUER_PUBLIC=$(json_field admin_public)"
echo "MAINNET_STELLAR_FUNDER_PUBLIC=$(json_field funder_public)"
echo "MAINNET_STELLAR_MSME_PUBLIC=$MSME_G"
