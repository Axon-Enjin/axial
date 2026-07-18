/**
 * POST /api/eis/horizon-poll
 *
 * Horizon/Soroban RPC event subscription endpoint.
 *
 * Polls the Soroban RPC getEvents API for contract events emitted by the
 * Axial contracts in the last LOOKBACK_LEDGERS. For each new event not
 * already in the EIS store, enqueues oracle processing. Fully idempotent.
 *
 * Intended to be invoked by GCP Cloud Scheduler every 10 minutes
 * (see docs/ops-cloud-scheduler.md) so that EIS submissions happen even if
 * the API hook was missed (e.g., request timeout, server restart, or
 * Freighter-signed transactions submitted without hitting the Axial API routes).
 *
 * Security: requires Authorization: Bearer {CRON_SECRET} header.
 */
import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron/auth";
import { getSorobanConfig } from "@/lib/soroban/config";
import { pollHorizonEvents } from "@/lib/eis/horizon-poll";
import type { StellarNetworkId } from "@/lib/soroban/network";

function contractIdsForNetwork(network: StellarNetworkId): string[] {
  const cfg = getSorobanConfig(network);
  return [
    cfg.swapContractId,
    cfg.receivableContractId,
    cfg.payrollContractId,
    cfg.settlementContractId,
  ].filter((id): id is string => Boolean(id));
}

export async function POST(request: Request) {
  const denied = assertCronAuthorized(request);
  if (denied) return denied;

  const networks: StellarNetworkId[] = ["mainnet"];
  const polled: StellarNetworkId[] = [];
  let eventsScanned = 0;
  let newEnqueued = 0;
  let alreadyProcessed = 0;
  const errors: string[] = [];
  const contractsPolled: string[] = [];
  let latestLedger = 0;

  for (const network of networks) {
    const ids = contractIdsForNetwork(network);
    if (ids.length === 0) continue;

    polled.push(network);
    try {
      const cfg = getSorobanConfig(network);
      const result = await pollHorizonEvents(cfg.rpcUrl, ids, network);
      contractsPolled.push(...result.contractsPolled);
      eventsScanned += result.eventsScanned;
      newEnqueued += result.newEnqueued;
      alreadyProcessed += result.alreadyProcessed;
      errors.push(...result.errors.map((e) => `[${network}] ${e}`));
      latestLedger = Math.max(latestLedger, result.latestLedger);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Poll failed";
      errors.push(`[${network}] ${message}`);
      console.error(`[eis/horizon-poll/${network}]`, message);
    }
  }

  if (polled.length === 0) {
    return NextResponse.json({
      ok: true,
      message:
        "No contracts configured — set contract IDs in environment or deployments JSON.",
      networksPolled: [],
      contractsPolled: [],
      eventsScanned: 0,
      newEnqueued: 0,
    });
  }

  const status = errors.length > 0 ? 207 : 200;
  return NextResponse.json(
    {
      ok: true,
      networksPolled: polled,
      contractsPolled,
      eventsScanned,
      newEnqueued,
      alreadyProcessed,
      errors,
      latestLedger,
      message: `Scanned ${eventsScanned} events on ${polled.join(", ")}. Enqueued ${newEnqueued} new.`,
    },
    { status },
  );
}

export async function GET(request: Request) {
  return POST(request);
}
