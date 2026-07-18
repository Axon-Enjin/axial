/**
 * POST /api/eis/worker
 *
 * T+3 BIR EIS submission worker endpoint.
 *
 * Processes stale (queued/failed) EIS submissions within their T+3 window
 * and marks expired submissions as permanently failed.
 *
 * Intended to be invoked by GCP Cloud Scheduler (see docs/ops-cloud-scheduler.md)
 * on a regular schedule. Also callable manually for debugging.
 *
 * Security: requires Authorization: Bearer {CRON_SECRET} header.
 * Cloud Scheduler jobs should send the same header from the CRON_SECRET
 * secret. For manual calls, set the same header.
 */
import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron/auth";
import { runEisWorker } from "@/lib/eis/worker";

export async function POST(request: Request) {
  const denied = assertCronAuthorized(request);
  if (denied) return denied;

  try {
    const result = await runEisWorker();
    const status = result.errors.length > 0 ? 207 : 200;
    return NextResponse.json({
      ok: true,
      ...result,
      message: `Retried ${result.retried} submissions, ${result.succeeded} succeeded, ${result.expired} expired.`,
    }, { status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Worker failed";
    console.error("[eis/worker]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

// Allow GET for scheduler health checks that ping with GET
export async function GET(request: Request) {
  return POST(request);
}
