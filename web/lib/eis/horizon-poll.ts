/**
 * Stellar Horizon / Soroban RPC event subscription for the EIS oracle.
 *
 * Polls the Soroban RPC getEvents endpoint for contract events emitted by
 * the Axial contracts (receivable_token, axial_swap, payroll_split). For
 * each event not already in the EIS submission store, enqueues oracle
 * processing to ensure BIR EIS coverage is event-driven — not just
 * API-hook-driven.
 *
 * Idempotency: processLedgerEvent() checks findByIdempotencyKey() before
 * processing, so duplicate scans are safe no-ops.
 *
 * Lookback window: always scans the last `LOOKBACK_LEDGERS` ledgers so
 * the poller is stateless (no cursor storage needed for a serverless env).
 * With Stellar's ~5s block time and a 10-minute cron, 1000 ledgers (~83min)
 * provides comfortable overlap for cron jitter and retries.
 */

import { rpc, scValToNative } from "@stellar/stellar-sdk";
import type { xdr } from "@stellar/stellar-sdk";
import { enqueueEisProcessing } from "./oracle";
import { buildIdempotencyKey, findByIdempotencyKey } from "./store";
import type { StellarNetworkId } from "@/lib/soroban/network";
import type { ChainLedgerEvent, LedgerEventKind } from "./types";

const LOOKBACK_LEDGERS = 1000;
const ORG_ID = process.env.AXIAL_ORG_ID ?? "demo-msme";

export type PollResult = {
  contractsPolled: string[];
  eventsScanned: number;
  newEnqueued: number;
  alreadyProcessed: number;
  errors: string[];
  latestLedger: number;
};

/** Maps Soroban contract event name symbols to EIS oracle kinds. */
const EVENT_KIND_MAP: Record<string, LedgerEventKind> = {
  ReceivableMinted: "receivable_minted",
  SwapExecuted: "swap_executed",
  PayrollRouted: "payroll_routed",
};

/**
 * Safely decodes an ScVal topic entry to a native JS value.
 * Returns null if decoding fails (defensive — malformed events are ignored).
 */
function decodeScVal(scVal: xdr.ScVal): unknown {
  try {
    return scValToNative(scVal);
  } catch {
    return null;
  }
}

/**
 * Extracts the amount from decoded Soroban event data.
 * Handles both swap (face_amount) and payroll (gross_amount) event shapes.
 */
function extractAmount(data: unknown): number {
  if (data == null || typeof data !== "object") return 0;
  const d = data as Record<string, unknown>;
  const raw = d["face_amount"] ?? d["gross_amount"] ?? d["advance_amount"] ?? 0;
  if (typeof raw === "bigint") return Number(raw);
  if (typeof raw === "number") return raw;
  return 0;
}

export async function pollHorizonEvents(
  rpcUrl: string,
  contractIds: string[],
  network: StellarNetworkId,
): Promise<PollResult> {
  const result: PollResult = {
    contractsPolled: contractIds.filter(Boolean),
    eventsScanned: 0,
    newEnqueued: 0,
    alreadyProcessed: 0,
    errors: [],
    latestLedger: 0,
  };

  if (result.contractsPolled.length === 0) {
    return result;
  }

  const server = new rpc.Server(rpcUrl);

  // Get current ledger to establish lookback window
  let currentLedger: number;
  try {
    const ledgerInfo = await server.getLatestLedger();
    currentLedger = ledgerInfo.sequence;
    result.latestLedger = currentLedger;
  } catch (err) {
    result.errors.push(
      `getLatestLedger failed: ${err instanceof Error ? err.message : String(err)}`,
    );
    return result;
  }

  const startLedger = Math.max(1, currentLedger - LOOKBACK_LEDGERS);

  // Fetch events for all Axial contracts
  let events: rpc.Api.EventResponse[];
  try {
    const response = await server.getEvents({
      startLedger,
      filters: [
        {
          type: "contract",
          contractIds: result.contractsPolled,
        },
      ],
      limit: 200,
    });
    events = response.events ?? [];
  } catch (err) {
    result.errors.push(
      `getEvents failed: ${err instanceof Error ? err.message : String(err)}`,
    );
    return result;
  }

  result.eventsScanned = events.length;

  // Process each event
  await Promise.allSettled(
    events
      .filter((e) => e.inSuccessfulContractCall)
      .map(async (e) => {
        try {
          // topic[0] = event name symbol (e.g., "SwapExecuted")
          const eventName = decodeScVal(e.topic[0]) as string | null;
          if (!eventName) return;

          const kind = EVENT_KIND_MAP[eventName];
          if (!kind) return; // Unrecognized event — ignore

          // topic[1] = referenceId (invoice_id or payroll_id as Soroban String)
          const referenceId = decodeScVal(e.topic[1]) as string | null;
          if (!referenceId) return;

          const txHash = e.txHash;
          if (!txHash) return;

          // Check idempotency — skip if already processed
          const idempotencyKey = buildIdempotencyKey(ORG_ID, txHash, referenceId);
          const existing = await findByIdempotencyKey(idempotencyKey);
          if (existing?.status === "memo_written") {
            result.alreadyProcessed++;
            return;
          }

          // Decode event data for amount
          const eventData = decodeScVal(e.value);
          const amount = extractAmount(eventData);

          const chainEvent: ChainLedgerEvent = {
            kind,
            referenceId,
            stellarTxHash: txHash,
            amount,
            network,
          };

          enqueueEisProcessing(chainEvent);
          result.newEnqueued++;
        } catch (eventErr) {
          result.errors.push(
            `Event ${e.id}: ${eventErr instanceof Error ? eventErr.message : String(eventErr)}`,
          );
        }
      }),
  );

  return result;
}
