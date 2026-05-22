/**
 * POST /api/eis/horizon-poll
 *
 * Horizon/Soroban RPC event subscription endpoint.
 *
 * Polls the Soroban RPC getEvents API for contract events emitted by the
 * Axial contracts in the last LOOKBACK_LEDGERS. For each new event not
 * already in the EIS store, enqueues oracle processing. Fully idempotent.
 *
 * Intended to be invoked by Vercel Cron every 10 minutes so that EIS
 * submissions happen even if the API hook was missed (e.g., request timeout,
 * server restart, or Freighter-signed transactions submitted without hitting
 * the Axial API routes).
 *
 * Security: requires Authorization: Bearer {CRON_SECRET} header.
 */
import { NextResponse } from "next/server";
import { getSorobanConfig } from "@/lib/soroban/config";
import { pollHorizonEvents } from "@/lib/eis/horizon-poll";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cfg = getSorobanConfig();

  // Collect all configured contract IDs
  const contractIds = [
    cfg.swapContractId,
    cfg.receivableContractId,
    cfg.payrollContractId,
    cfg.settlementContractId,
  ].filter((id): id is string => Boolean(id));

  if (contractIds.length === 0) {
    return NextResponse.json({
      ok: true,
      message: "No contracts configured — set contract IDs in environment or testnet.json.",
      contractsPolled: [],
      eventsScanned: 0,
      newEnqueued: 0,
    });
  }

  try {
    const result = await pollHorizonEvents(cfg.rpcUrl, contractIds);
    const status = result.errors.length > 0 ? 207 : 200;
    return NextResponse.json({
      ok: true,
      ...result,
      message: `Scanned ${result.eventsScanned} events across ${result.contractsPolled.length} contracts. Enqueued ${result.newEnqueued} new.`,
    }, { status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Poll failed";
    console.error("[eis/horizon-poll]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
