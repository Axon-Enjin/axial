#!/usr/bin/env bash
# Upload MAINNET_STELLAR_*_SECRET from web/.env.local → GCP Secret Manager (WSL + gcloud).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_ENV="$ROOT/../web/.env.local"
PROJECT="${GCP_PROJECT_ID:-geraldberongoy}"

if [[ ! -f "$WEB_ENV" ]]; then
  echo "ERROR: Missing $WEB_ENV — run ./scripts/write-mainnet-web-env.sh first"
  exit 1
fi
if ! command -v gcloud >/dev/null 2>&1; then
  echo "SKIP: gcloud not in WSL — install Google Cloud SDK in WSL or set secrets in GCP console"
  exit 0
fi

get_env() {
  grep -E "^${1}=" "$WEB_ENV" | tail -1 | cut -d= -f2-
}

upload_secret() {
  local name="$1"
  local value
  value=$(get_env "$name")
  if [[ -z "$value" ]]; then
    echo "SKIP: $name not in .env.local"
    return 0
  fi
  if [[ ! "$value" =~ ^S[A-Z0-9]{55}$ ]]; then
    echo "ERROR: $name must be 56-char secret (S...)"
    exit 1
  fi
  if gcloud secrets describe "$name" --project="$PROJECT" >/dev/null 2>&1; then
    echo "==> Updating $name"
    printf '%s' "$value" | gcloud secrets versions add "$name" --project="$PROJECT" --data-file=-
  else
    echo "==> Creating $name"
    printf '%s' "$value" | gcloud secrets create "$name" \
      --project="$PROJECT" \
      --replication-policy=automatic \
      --data-file=-
  fi
}

echo "==> GCP Secret Manager (project: $PROJECT)"
for s in MAINNET_STELLAR_ISSUER_SECRET MAINNET_STELLAR_FUNDER_SECRET MAINNET_STELLAR_MSME_SECRET; do
  upload_secret "$s"
done
echo "==> Done"
