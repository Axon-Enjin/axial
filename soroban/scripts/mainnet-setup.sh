#!/usr/bin/env bash
# One-command mainnet setup — WSL only (Stellar CLI + env + optional GCP).
# Cloud Run image deploy stays in GitHub Actions / your existing PowerShell CI.
#
#   cd soroban
#   sed -i 's/\r$//' scripts/*.sh
#   ./scripts/mainnet-setup.sh              # sync env + GCP (contracts already in mainnet.json)
#   ./scripts/mainnet-setup.sh --deploy     # build + deploy + sync
#   ./scripts/mainnet-setup.sh --env-only   # web/.env.local only, skip gcloud
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DEPLOY_JSON="$ROOT/deployments/mainnet.json"
FREIGHTER_MSME="${MSME_FREIGHTER_PUBLIC:-GDSCTQZRRGF23F5GWNE3FYLLPEGO23BB3RQ6AYO5756C7A4HJLEXZVTQ}"
SOURCE_KEY="${SOURCE_KEY:-mainnet-wallet}"
DEPLOYER_KEY="${ADMIN_STELLAR_KEY:-mainnet-deployer}"

DO_DEPLOY=false
ENV_ONLY=false
for arg in "$@"; do
  case "$arg" in
    --deploy) DO_DEPLOY=true ;;
    --env-only) ENV_ONLY=true ;;
    -h|--help)
      echo "Usage: ./scripts/mainnet-setup.sh [--deploy] [--env-only]"
      exit 0
      ;;
  esac
done

echo "==> Axial mainnet setup (WSL)"

if ! command -v stellar >/dev/null 2>&1; then
  echo "ERROR: Install Stellar CLI in WSL: https://developers.stellar.org/docs/tools/cli"
  exit 1
fi

if ! stellar network ls 2>/dev/null | grep -qx mainnet; then
  echo "==> Registering mainnet network"
  stellar network add mainnet \
    --rpc-url https://mainnet.sorobanrpc.com \
    --network-passphrase "Public Global Stellar Network ; September 2015"
fi

json_field() {
  grep -oE "\"$1\": \"[^\"]+\"" "$DEPLOY_JSON" 2>/dev/null | head -1 | cut -d'"' -f4 || true
}

ensure_deployer_identity() {
  local expected="${1:-}"
  if [[ ! -f "$DEPLOY_JSON" ]]; then
    echo "ERROR: $DEPLOY_JSON missing — run with --deploy or copy a valid mainnet.json"
    exit 1
  fi
  expected="${expected:-$(json_field admin_public)}"
  DEPLOYER_KEY="${ADMIN_STELLAR_KEY:-$(json_field admin_key)}"
  DEPLOYER_KEY="${DEPLOYER_KEY:-mainnet-deployer}"

  if stellar keys public-key "$DEPLOYER_KEY" >/dev/null 2>&1; then
    local actual
    actual=$(stellar keys public-key "$DEPLOYER_KEY")
    if [[ "$actual" != "$expected" ]]; then
      echo "WARN: '$DEPLOYER_KEY' is $actual but mainnet.json expects $expected"
      echo "      Syncing public config only. Fix identity then re-run setup."
    else
      echo "==> Deployer identity OK: $DEPLOYER_KEY → $actual"
    fi
  else
    echo "WARN: Identity '$DEPLOYER_KEY' not in WSL — syncing contracts from mainnet.json only."
    echo "      For server mint/swap: MAINNET_DEPLOYER_SECRET='S...' ./scripts/import-mainnet-deployer.sh"
  fi
  export ADMIN_STELLAR_KEY="$DEPLOYER_KEY"
}

if $DO_DEPLOY; then
  echo "==> Deploying contracts to mainnet (source: $SOURCE_KEY)"
  export SOURCE_KEY
  bash "$ROOT/scripts/deploy-mainnet.sh"
  DEPLOYER_KEY="$SOURCE_KEY"
  export ADMIN_STELLAR_KEY="$DEPLOYER_KEY"
else
  ensure_deployer_identity
  echo "==> Ensure contracts are initialized (no-op if already done)"
  bash "$ROOT/scripts/initialize-mainnet.sh" || {
    echo "WARN: initialize-mainnet.sh failed — mint/swap will error until admin runs it in WSL"
  }
fi

export MSME_FREIGHTER_PUBLIC="$FREIGHTER_MSME"
echo "==> Writing web/.env.local MAINNET_* block"
bash "$ROOT/scripts/write-mainnet-web-env.sh"

bash "$ROOT/scripts/print-github-mainnet-vars.sh"

if ! $ENV_ONLY; then
  bash "$ROOT/scripts/upload-gcp-mainnet-secrets.sh" || true
  bash "$ROOT/scripts/apply-github-mainnet-vars.sh" || true
fi

echo ""
echo "==> Mainnet setup complete"
echo "    YOUR wallet (fund & Freighter): $FREIGHTER_MSME"
echo "    TEAMMATE deployer (server mint/swap): $(json_field admin_public 2>/dev/null || echo 'see mainnet.json')"
echo "    1. Freighter → Mainnet → connect $FREIGHTER_MSME"
echo "    2. Fund GDSCT with XLM + USDC trustline (receive swap advance)"
echo "    3. App Settings → Stellar network → Mainnet"
echo "    4. Redeploy Cloud Run (push main) if GCP secrets were updated"
echo "    Docs: docs/teammate-mainnet-handoff.md"
