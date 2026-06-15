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

upload_stellar_secret() {
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
  upload_any_secret "$name" "$value"
}

upload_any_secret() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    echo "SKIP: $name empty"
    return 0
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

ensure_funder_portal_token() {
  local existing
  existing=$(get_env "AXIAL_FUNDER_PORTAL_TOKEN" || true)
  if [[ -n "$existing" ]]; then
    echo "==> AXIAL_FUNDER_PORTAL_TOKEN already in .env.local"
    return 0
  fi
  local token
  token=$(openssl rand -base64 32 | tr '+/' '-_' | tr -d '=')
  echo "" >> "$WEB_ENV"
  echo "# Funder portal magic link (?token=...) for external LPs" >> "$WEB_ENV"
  echo "AXIAL_FUNDER_PORTAL_TOKEN=$token" >> "$WEB_ENV"
  echo "==> Generated AXIAL_FUNDER_PORTAL_TOKEN in web/.env.local"
}

upload_secret() {
  upload_stellar_secret "$1"
}

echo "==> Ensuring funder portal token in .env.local"
ensure_funder_portal_token

echo "==> GCP Secret Manager (project: $PROJECT)"
for s in MAINNET_STELLAR_ISSUER_SECRET MAINNET_STELLAR_FUNDER_SECRET MAINNET_STELLAR_MSME_SECRET; do
  upload_stellar_secret "$s"
done

for s in SUPABASE_SERVICE_ROLE_KEY AXIAL_FUNDER_PORTAL_TOKEN; do
  v=$(get_env "$s" || true)
  if [[ -n "$v" ]]; then
    upload_any_secret "$s" "$v"
  else
    echo "SKIP: $s not in .env.local"
  fi
done

BASE_URL=$(get_env "NEXT_PUBLIC_BASE_URL" || true)
TOKEN=$(get_env "AXIAL_FUNDER_PORTAL_TOKEN" || true)
if [[ -n "$TOKEN" ]]; then
  echo ""
  echo "LP portal link (share with external funder):"
  if [[ -n "$BASE_URL" ]]; then
    echo "${BASE_URL%/}/app/funder-portal?token=${TOKEN}"
  else
    echo "/app/funder-portal?token=${TOKEN}"
  fi
fi
