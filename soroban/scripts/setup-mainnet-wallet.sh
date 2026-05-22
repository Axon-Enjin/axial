#!/usr/bin/env bash
# One-time: import Freighter mainnet secret into Stellar CLI (WSL).
# Usage: ./scripts/setup-mainnet-wallet.sh
set -euo pipefail

KEY_NAME="${1:-mainnet-wallet}"
EXPECTED="${EXPECTED_MAINNET_PUBLIC:-GDSCTQZRRGF23F5GWNE3FYLLPEGO23BB3RQ6AYO5756C7A4HJLEXZVTQ}"

echo "Import deployer secret into Stellar CLI identity: $KEY_NAME"
echo "Freighter → Settings → Security → Export secret key (starts with S...)"
echo ""
echo "Run manually (secret is not echoed):"
echo "  stellar keys add $KEY_NAME --secret-key"
echo ""

if stellar keys public-key "$KEY_NAME" >/dev/null 2>&1; then
  PK=$(stellar keys public-key "$KEY_NAME")
  echo "Identity '$KEY_NAME' exists: $PK"
  if [[ "$PK" != "$EXPECTED" ]]; then
    echo "WARN: Public key differs from Freighter $EXPECTED"
    echo "      Existing mainnet.json may use a different deployer (check deployments/mainnet.json)."
  else
    echo "OK: Matches expected Freighter mainnet wallet."
  fi
else
  echo "Identity '$KEY_NAME' not found yet — run stellar keys add above."
  exit 1
fi
