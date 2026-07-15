import { NextResponse } from "next/server";
import { listSubmissions } from "@/lib/eis/store";

function assertCronAuth(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * GET /api/eis/monitor — stuck submissions past T+3 window.
 * Wire to Cloud Scheduler or external alerting.
 */
export async function GET(request: Request) {
  const denied = assertCronAuth(request);
  if (denied) return denied;

  const rows = await listSubmissions(500);
  const now = Date.now();
  const stuck = rows.filter((r) => {
    if (r.status !== "queued" && r.status !== "failed") return false;
    if (r.dueBy) return new Date(r.dueBy).getTime() < now;
    const created = new Date(r.createdAt).getTime();
    const t3Ms = 3 * 24 * 60 * 60 * 1000;
    return now - created > t3Ms;
  });

  return NextResponse.json({
    scanned: rows.length,
    stuckCount: stuck.length,
    stuck: stuck.map((s) => ({
      id: s.id,
      referenceId: s.referenceId,
      status: s.status,
      date: s.createdAt,
      eventKind: s.eventKind,
    })),
    alert: stuck.length > 0,
  });
}
