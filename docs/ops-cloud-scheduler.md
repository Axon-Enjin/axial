# GCP Cloud Scheduler — Axial Cron Jobs

Axial background workers are HTTP endpoints on Cloud Run. Schedule them with **GCP Cloud Scheduler**.

## Jobs

| Job name | Endpoint | Schedule | Purpose |
|----------|----------|----------|---------|
| `axial-eis-worker` | `POST /api/eis/worker` | `0 */6 * * *` | T+3 retry / expiry |
| `axial-eis-horizon-poll` | `POST /api/eis/horizon-poll` | `*/10 * * * *` | Chain event ingest |
| `axial-reconciliation-scan` | `POST /api/reconciliation/scan` | `0 2 * * *` | Leakage scan |

## Auth

Set `CRON_SECRET` on Cloud Run. Each request must include:

```
Authorization: Bearer <CRON_SECRET>
```

When `CRON_SECRET` is unset (local dev), worker endpoints allow unauthenticated calls.

## Setup script

From repo root (requires `gcloud` CLI):

```bash
chmod +x scripts/setup-gcp-cloud-scheduler.sh
./scripts/setup-gcp-cloud-scheduler.sh https://YOUR_CLOUD_RUN_URL "$CRON_SECRET"
```

## Manual smoke

```bash
curl -X POST "https://YOUR_CLOUD_RUN_URL/api/eis/worker" \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Region

Default: `asia-southeast1` (matches `.github/workflows/deploy-cloudrun.yml`).
