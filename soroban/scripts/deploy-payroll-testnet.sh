#!/usr/bin/env bash
# Deploy + initialize payroll_split on testnet and patch deployments/testnet.json
# Run from WSL: cd soroban && sed -i 's/\r$//' scripts/deploy-payroll-testnet.sh && ./scripts/deploy-payroll-testnet.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DEPLOYER_KEY="admin-key"
FUNDER_KEY="treasury-key"
MSME_KEY="my-key"
ADMIN_G="GD67NPG7TKJDE5HEHSPWS3YAWYNHWTLWRSQMTO4NQOVSZAEFPICO3HYG"
FUNDER_G="GBRLGRWUJXJSHJDZQ4OH2SDH7ROF7EWAHI4ZIQM2E6TMONH7IG4P7QKL"
MSME_G="GBCVJCRULTHI74CXNP4QFGE6OSK5XFUYIPPEONRNXS3JQSKA26TDAR66"
NETWORK="testnet"
SSS_BPS=1100
PHIL_BPS=500
PAGIBIG_BPS=200

DEPLOY_JSON="$ROOT/deployments/testnet.json"
if [[ ! -f "$DEPLOY_JSON" ]]; then
  echo "ERROR: Missing $DEPLOY_JSON — run ./scripts/testnet-demo-setup.sh first"
  exit 1
fi

TOKEN_ID=$(grep -oE '"usdc_token": "[^"]+"' "$DEPLOY_JSON" | cut -d'"' -f4)
if [[ -z "$TOKEN_ID" ]]; then
  echo "ERROR: usdc_token missing in testnet.json"
  exit 1
fi

echo "==> Building payroll_split"
make build

WASM="$ROOT/target/wasm32v1-none/release/payroll_split.wasm"
echo "==> Deploying payroll_split"
PAYROLL_ID=$(stellar contract deploy \
  --wasm "$WASM" \
  --source-account "$DEPLOYER_KEY" \
  --network "$NETWORK" 2>&1 | tee /tmp/payroll-deploy.log | tail -1)
if [[ ! "$PAYROLL_ID" =~ ^C[A-Z0-9]{55}$ ]]; then
  PAYROLL_ID=$(grep -oE 'C[A-Z0-9]{55}' /tmp/payroll-deploy.log | tail -1)
fi
echo "    payroll_split: $PAYROLL_ID"

echo "==> Initializing payroll_split (demo agency addresses = treasury)"
stellar contract invoke \
  --id "$PAYROLL_ID" \
  --source-account "$DEPLOYER_KEY" \
  --network "$NETWORK" \
  -- \
  initialize \
  --admin "$ADMIN_G" \
  --usdc "$TOKEN_ID" \
  --sss "$FUNDER_G" \
  --philhealth "$FUNDER_G" \
  --pagibig "$FUNDER_G" \
  --employees "$MSME_G" \
  --sss_bps "$SSS_BPS" \
  --philhealth_bps "$PHIL_BPS" \
  --pagibig_bps "$PAGIBIG_BPS"

# Patch payroll_split id into testnet.json (requires python or node; use sed fallback)
if command -v python3 >/dev/null; then
  python3 - <<PY
import json
from pathlib import Path
p = Path("$DEPLOY_JSON")
data = json.loads(p.read_text())
data.setdefault("contracts", {})["payroll_split"] = "$PAYROLL_ID"
p.write_text(json.dumps(data, indent=2) + "\n")
PY
else
  echo "WARN: install python3 to auto-patch testnet.json — set payroll_split manually to $PAYROLL_ID"
fi

echo "==> Updating web/.env.local"
./scripts/write-web-env.sh

echo ""
echo "=============================================="
echo "  payroll_split ready on testnet"
echo "=============================================="
echo "  Contract: $PAYROLL_ID"
echo "  MSME needs USDC balance (run Liquidity swap first)"
echo "  Then: cd ../web && npm run dev → /compliance → Route Payroll"
echo "=============================================="
