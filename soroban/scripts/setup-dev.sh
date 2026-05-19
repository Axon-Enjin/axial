#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Axial Soroban dev setup"
echo "    workspace: $ROOT"

if ! command -v stellar >/dev/null; then
  echo "ERROR: stellar CLI not found. Install: https://developers.stellar.org/docs/tools/developer-tools/cli/stellar-cli"
  exit 1
fi

if ! stellar network ls 2>/dev/null | grep -qx 'testnet'; then
  echo "==> Adding testnet network"
  stellar network add testnet \
    --rpc-url https://soroban-testnet.stellar.org:443 \
    --network-passphrase "Test SDF Network ; September 2015"
else
  echo "==> testnet network already configured"
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "==> Created soroban/.env from .env.example"
  echo "    Edit STELLAR_SOURCE to your identity name before deploy."
else
  echo "==> soroban/.env already exists (skipped)"
fi

if [[ ! -f deployments/testnet.json ]]; then
  cp deployments/testnet.example.json deployments/testnet.json
  echo "==> Created deployments/testnet.json (fill contract IDs after deploy)"
fi

DEFAULT_KEY="${USER:-dev}-axial"
if ! stellar keys address "$DEFAULT_KEY" &>/dev/null; then
  echo "==> Generating identity: $DEFAULT_KEY"
  stellar keys generate "$DEFAULT_KEY" --network testnet
fi

echo "==> Funding $DEFAULT_KEY on testnet (friendbot)"
stellar keys fund "$DEFAULT_KEY" --network testnet || true

echo ""
echo "Public address: $(stellar keys address "$DEFAULT_KEY")"
echo ""
echo "Next steps:"
echo "  1. Set STELLAR_SOURCE=$DEFAULT_KEY in soroban/.env (if not already)"
echo "  2. make build && make test"
echo "  3. make deploy-all  — then paste contract IDs into deployments/testnet.json"
echo ""
