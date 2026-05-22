#!/usr/bin/env bash
# Import teammate deployer secret (GB6TMT…) into WSL Stellar CLI.
#
# Usage (pick one):
#   MAINNET_DEPLOYER_SECRET='S...' ./scripts/import-mainnet-deployer.sh
#   ./scripts/import-mainnet-deployer.sh /path/to/secret.txt
#
# The file must contain ONLY the 56-character secret (starts with S). Never commit it.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_JSON="$ROOT/deployments/mainnet.json"
KEY_NAME="${STELLAR_IDENTITY:-mainnet-deployer}"

expected_pub() {
  grep -oE '"admin_public": "[^"]+"' "$DEPLOY_JSON" | head -1 | cut -d'"' -f4
}

EXPECTED=$(expected_pub)
SECRET=""

if [[ -n "${MAINNET_DEPLOYER_SECRET:-}" ]]; then
  SECRET="${MAINNET_DEPLOYER_SECRET//[[:space:]]/}"
elif [[ -n "${1:-}" && -f "$1" ]]; then
  SECRET="$(tr -d '[:space:]' < "$1")"
else
  echo "Paste the deployer secret (S... only, 56 chars) for $EXPECTED"
  echo "Then press Enter:"
  read -rs SECRET
  echo ""
  SECRET="${SECRET//[[:space:]]/}"
fi

if [[ ! "$SECRET" =~ ^S[A-Z2-7]{55}$ ]]; then
  echo "ERROR: Invalid secret format."
  echo "  Must be exactly 56 characters, start with S (Stellar secret key)."
  echo "  Do NOT paste:"
  echo "    - Public key (starts with G)"
  echo "    - Comments or shell lines starting with #"
  echo "    - Freighter seed phrase unless teammate gave you that for GB6TMT"
  exit 1
fi

if ! command -v stellar >/dev/null 2>&1; then
  echo "ERROR: stellar CLI not found in WSL"
  exit 1
fi

if stellar keys public-key "$KEY_NAME" >/dev/null 2>&1; then
  echo "Removing old identity $KEY_NAME ..."
  stellar keys rm "$KEY_NAME" -y 2>/dev/null || stellar keys remove "$KEY_NAME" 2>/dev/null || true
fi

printf '%s' "$SECRET" | stellar keys add "$KEY_NAME" --secret-key

ACTUAL=$(stellar keys public-key "$KEY_NAME")
echo "Imported $KEY_NAME → $ACTUAL"

if [[ "$ACTUAL" != "$EXPECTED" ]]; then
  echo ""
  echo "ERROR: This secret is for $ACTUAL, not deployer $EXPECTED in mainnet.json"
  echo "  Ask your teammate for the S... key that matches GB6TMT…"
  echo "  Your Freighter GDSCT… secret will NOT work for server mint/swap."
  exit 1
fi

echo "OK — matches mainnet.json deployer. Run: ./scripts/mainnet-setup.sh"
