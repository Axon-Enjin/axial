#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_JSON="$ROOT/deployments/testnet.json"
WEB_ENV="$ROOT/../web/.env.local"
FUNDER_KEY="treasury-key"

SWAP_ID=$(grep -oE '"axial_swap": "[^"]+"' "$DEPLOY_JSON" | cut -d'"' -f4)
TOKEN_ID=$(grep -oE '"usdc_token": "[^"]+"' "$DEPLOY_JSON" | cut -d'"' -f4)
FUNDER_G=$(grep -oE '"funder_public": "[^"]+"' "$DEPLOY_JSON" | cut -d'"' -f4)
MSME_G=$(grep -oE '"msme_public": "[^"]+"' "$DEPLOY_JSON" | cut -d'"' -f4)
FUNDER_SECRET=$(stellar keys secret "$FUNDER_KEY")

cat > "$WEB_ENV" <<EOF
# Auto-generated — do not commit
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
AXIAL_SWAP_CONTRACT_ID=$SWAP_ID
SOROBAN_USDC_TOKEN_ID=$TOKEN_ID
STELLAR_FUNDER_SECRET=$FUNDER_SECRET
STELLAR_FUNDER_PUBLIC=$FUNDER_G
STELLAR_MSME_PUBLIC=$MSME_G
EOF
echo "Wrote $WEB_ENV"
