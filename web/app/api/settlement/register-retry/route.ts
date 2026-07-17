/**
 * Cron: retry pending settlement::register_invoice after swap succeeded.
 */
import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron/auth";
import { runPendingRegistrationWorker } from "@/lib/settlement/pending-registration";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const denied = assertCronAuthorized(request);
  if (denied) return denied;
  try {
    const result = await runPendingRegistrationWorker();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Register retry failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
