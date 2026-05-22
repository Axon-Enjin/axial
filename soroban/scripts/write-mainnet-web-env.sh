#!/usr/bin/env bash
# Merge MAINNET_* lines into web/.env.local from deployments/mainnet.json + stellar CLI secrets.
# Run from WSL soroban/:  ./scripts/write-mainnet-web-env.sh
#
# Optional env:
#   MSME_FREIGHTER_PUBLIC=GDSCTQZ...   # Freighter receive address (issuer/funder stay deployer)
#   ADMIN_STELLAR_KEY=my-key           # override roles.admin_key from JSON

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_JSON="$ROOT/deployments/mainnet.json"
WEB_ENV="$ROOT/../web/.env.local"

if [[ ! -f "$DEPLOY_JSON" ]]; then
  echo "ERROR: Missing $DEPLOY_JSON — run ./scripts/deploy-mainnet.sh first"
  exit 1
fi

json_field() {
  grep -oE "\"$1\": \"[^\"]+\"" "$DEPLOY_JSON" | head -1 | cut -d'"' -f4
}

SWAP_ID=$(json_field axial_swap)
RECV_ID=$(json_field receivable_token)
PAYROLL_ID=$(json_field payroll_split)
SETTLEMENT_ID=$(json_field settlement || true)
USDC_ID=$(json_field usdc_token)
ISSUER_G=$(json_field admin_public)
FUNDER_G=$(json_field funder_public)
MSME_G="${MSME_FREIGHTER_PUBLIC:-$(json_field msme_public)}"
ADMIN_KEY="${ADMIN_STELLAR_KEY:-$(json_field admin_key)}"

if [[ -z "$SWAP_ID" || -z "$RECV_ID" || -z "$PAYROLL_ID" ]]; then
  echo "ERROR: mainnet.json missing L1 contract IDs"
  exit 1
fi

HAVE_SECRETS=false
ISSUER_SECRET=""
FUNDER_SECRET=""
MSME_SECRET=""

if command -v stellar >/dev/null 2>&1 && stellar keys public-key "$ADMIN_KEY" >/dev/null 2>&1; then
  KEY_PUBLIC=$(stellar keys public-key "$ADMIN_KEY")
  if [[ "$KEY_PUBLIC" == "$ISSUER_G" ]]; then
    ISSUER_SECRET=$(stellar keys secret "$ADMIN_KEY" 2>/dev/null || true)
    if [[ "$ISSUER_SECRET" =~ ^S[A-Z0-9]{55}$ ]]; then
      FUNDER_SECRET="$ISSUER_SECRET"
      MSME_SECRET="$ISSUER_SECRET"
      HAVE_SECRETS=true
    fi
  else
    echo "WARN: '$ADMIN_KEY' is $KEY_PUBLIC — expected $ISSUER_G (public keys only for now)"
  fi
else
  echo "WARN: Stellar identity '$ADMIN_KEY' not in WSL — writing contract IDs + public keys only"
  echo "      Mint/swap on server needs: stellar keys add $ADMIN_KEY --secret-key"
fi

echo "Deployer (issuer/funder): $ISSUER_G"
echo "MSME public (mint recipient): $MSME_G"

touch "$WEB_ENV"
if grep -q '^# --- MAINNET' "$WEB_ENV" 2>/dev/null; then
  sed -i '/^# --- MAINNET/,/^# --- END MAINNET/d' "$WEB_ENV"
fi

{
  echo ""
  echo "# --- MAINNET (from deployments/mainnet.json $(date -u +%Y-%m-%d)) ---"
  echo "MAINNET_SOROBAN_RPC_URL=https://mainnet.sorobanrpc.com"
  echo "MAINNET_STELLAR_NETWORK_PASSPHRASE=Public Global Stellar Network ; September 2015"
  echo "MAINNET_AXIAL_SWAP_CONTRACT_ID=$SWAP_ID"
  echo "MAINNET_RECEIVABLE_TOKEN_CONTRACT_ID=$RECV_ID"
  echo "MAINNET_PAYROLL_SPLIT_CONTRACT_ID=$PAYROLL_ID"
  echo "MAINNET_SETTLEMENT_CONTRACT_ID=$SETTLEMENT_ID"
  echo "MAINNET_SOROBAN_USDC_TOKEN_ID=$USDC_ID"
  echo "MAINNET_STELLAR_ISSUER_PUBLIC=$ISSUER_G"
  echo "MAINNET_STELLAR_FUNDER_PUBLIC=$FUNDER_G"
  echo "MAINNET_STELLAR_MSME_PUBLIC=$MSME_G"
  if $HAVE_SECRETS; then
    echo "MAINNET_STELLAR_ISSUER_SECRET=$ISSUER_SECRET"
    echo "MAINNET_STELLAR_FUNDER_SECRET=$FUNDER_SECRET"
    echo "MAINNET_STELLAR_MSME_SECRET=$MSME_SECRET"
  else
    echo "# MAINNET_STELLAR_*_SECRET=  # run: stellar keys add $ADMIN_KEY --secret-key  then re-run mainnet-setup.sh"
  fi
  echo "# --- END MAINNET ---"
} >> "$WEB_ENV"

echo "Updated $WEB_ENV"
if ! $HAVE_SECRETS; then
  echo "NEXT: MAINNET_DEPLOYER_SECRET='S...' ./scripts/import-mainnet-deployer.sh"
fi
