#!/usr/bin/env bash
# Push MAINNET_* GitHub Actions variables via gh (requires gh auth).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/.." && pwd)"

if ! command -v gh >/dev/null 2>&1; then
  echo "SKIP: install GitHub CLI (gh) and run 'gh auth login'"
  echo "      Or run: ./scripts/print-github-mainnet-vars.sh"
  echo "      and paste into GitHub → Settings → Variables"
  exit 0
fi

cd "$REPO_ROOT"
echo "==> Setting GitHub repository variables"
while IFS= read -r line; do
  [[ -z "$line" || "$line" =~ ^# ]] && continue
  name="${line%%=*}"
  value="${line#*=}"
  gh variable set "$name" --body "$value"
  echo "  $name"
done < <(bash "$ROOT/scripts/print-github-mainnet-vars.sh")
echo "==> Done"
