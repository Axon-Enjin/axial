#!/usr/bin/env bash
# Wire GCP Cloud Scheduler jobs for Axial background workers.
# Usage: ./scripts/setup-gcp-cloud-scheduler.sh <CLOUD_RUN_URL> <CRON_SECRET>
#
# Example:
#   ./scripts/setup-gcp-cloud-scheduler.sh https://axial-web-xxxxx.run.app my-secret

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <CLOUD_RUN_URL> <CRON_SECRET>"
  exit 1
fi

BASE_URL="${1%/}"
SECRET="$2"
REGION="${GCP_REGION:-asia-southeast1}"
PROJECT="${GCP_PROJECT:-}"

if [[ -z "$PROJECT" ]]; then
  echo "Set GCP_PROJECT or pass via gcloud config"
  exit 1
fi

create_job() {
  local name="$1"
  local schedule="$2"
  local path="$3"
  local uri="${BASE_URL}${path}"

  gcloud scheduler jobs delete "$name" --location="$REGION" --quiet 2>/dev/null || true

  gcloud scheduler jobs create http "$name" \
    --location="$REGION" \
    --schedule="$schedule" \
    --uri="$uri" \
    --http-method=POST \
    --headers="Authorization=Bearer ${SECRET},Content-Type=application/json" \
    --attempt-deadline=300s \
    --description="Axial cron: ${path}"
}

create_job "axial-eis-worker" "0 */6 * * *" "/api/eis/worker"
create_job "axial-eis-horizon-poll" "*/10 * * * *" "/api/eis/horizon-poll"
create_job "axial-reconciliation-scan" "0 2 * * *" "/api/reconciliation/scan"

echo "Scheduler jobs created in ${REGION} for ${BASE_URL}"
