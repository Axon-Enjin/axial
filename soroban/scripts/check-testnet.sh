#!/usr/bin/env bash
set -euo pipefail

echo "Networks:"
stellar network ls
echo ""
echo "Keys:"
stellar keys ls
echo ""

if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  source .env
fi

SOURCE="${STELLAR_SOURCE:-}"
if [[ -n "$SOURCE" ]]; then
  keys=("$SOURCE")
else
  keys=()
  while read -r k; do keys+=("$k"); done < <(stellar keys ls 2>/dev/null | tail -n +2 || stellar keys ls)
fi

for k in "${keys[@]}"; do
  [[ -z "$k" ]] && continue
  if ! stellar keys address "$k" &>/dev/null; then
    continue
  fi
  addr=$(stellar keys address "$k")
  echo "=== $k ==="
  echo "  address: $addr"
  if stellar keys fund "$k" --network testnet 2>&1 | grep -q 'funded\|already\|Account'; then
    echo "  testnet: funded (or already has XLM)"
  fi
  echo ""
done

if [[ -f deployments/testnet.json ]]; then
  echo "Deployed contracts (deployments/testnet.json):"
  cat deployments/testnet.json
fi
