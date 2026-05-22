/**
 * POST /api/eis/worker
 *
 * T+3 BIR EIS submission worker endpoint.
 *
 * Processes stale (queued/failed) EIS submissions within their T+3 window
 * and marks expired submissions as permanently failed.
 *
 * Intended to be invoked by Vercel Cron (see vercel.json) on a regular
 * schedule. Also callable manually for debugging.
 *
 * Security: requires Authorization: Bearer {CRON_SECRET} header.
 * On Vercel, the cron runtime sets this automatically from the project's
 * CRON_SECRET environment variable. For manual calls, set the same header.
 */
import { NextResponse } from "next/server";
import { runEisWorker } from "@/lib/eis/worker";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // If no secret is configured, allow all (dev/demo mode)
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

// Allow GET for Vercel Cron compatibility (cron pings are GET requests in some configs)
export async function GET(request: Request) {
  return POST(request);
}
