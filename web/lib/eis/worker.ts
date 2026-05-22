/**
 * T+3 BIR EIS submission worker.
 *
 * Processes stale EIS submissions (queued or failed) that are still within
 * their T+3 deadline window. Marks expired submissions permanently failed.
 *
 * Designed to be called from a cron job (/api/eis/worker) on a regular
 * schedule (every 15–60 minutes) to ensure all transactions are submitted
 * to BIR within the 3-calendar-day window mandated by EIS regulations.
 *
 * All operations are idempotent — safe to call multiple times.
 */

import { processLedgerEvent } from "./oracle";
import {
  findExpiredSubmissions,
  findSubmissionsForRetry,
  upsertSubmission,
} from "./store";
import type { ChainLedgerEvent } from "./types";

export type WorkerResult = {
  /** Number of submissions attempted for retry. */
  retried: number;
  /** Number of submissions that reached memo_written after retry. */
  succeeded: number;
  /** Number of submissions past their T+3 deadline — marked permanently failed. */
  expired: number;
  /** Non-fatal errors (submission IDs + messages). */
  errors: string[];
};

export async function runEisWorker(): Promise<WorkerResult> {
  const result: WorkerResult = { retried: 0, succeeded: 0, expired: 0, errors: [] };

  // ── Step 1: Mark expired submissions ──────────────────────────────────────
  try {
    const expired = await findExpiredSubmissions();
    await Promise.allSettled(
      expired.map(async (sub) => {
        const now = new Date().toISOString();
        await upsertSubmission({
          ...sub,
          status: "failed",
          error: `T+3 deadline expired at ${sub.dueBy ?? "unknown"} — BIR submission window closed`,
          updatedAt: now,
        });
        result.expired++;
      }),
    );
  } catch (err) {
    result.errors.push(`Expire sweep failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ── Step 2: Retry queued/failed submissions within deadline ───────────────
  try {
    const stale = await findSubmissionsForRetry();
    result.retried = stale.length;

    await Promise.allSettled(
      stale.map(async (sub) => {
        // Reconstruct the ChainLedgerEvent from the stored submission
        const event: ChainLedgerEvent = {
          kind: sub.eventKind,
          referenceId: sub.referenceId,
          stellarTxHash: sub.stellarTxHash,
          // Use the stored payload amount as a best-effort reconstruction
          amount: sub.payload.totalAmountDue ?? sub.payload.grossAmount ?? 0,
        };

        try {
          const updated = await processLedgerEvent(event);
          if (updated.status === "memo_written" || updated.status === "acknowledged") {
            result.succeeded++;
          }
        } catch (err) {
          result.errors.push(
            `${sub.referenceId}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }),
    );
  } catch (err) {
    result.errors.push(`Retry sweep failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return result;
}
