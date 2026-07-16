/**
 * T+3 BIR EIS submission worker.
 *
 * Expires prepared/failed/queued past dueBy. Retries failed only via
 * submitPreparedSubmission (or processLedgerEvent when payload/JWS missing).
 * Never auto-submits `prepared` — that awaits human approve.
 */

import { processLedgerEvent, submitPreparedSubmission } from "./oracle";
import {
  findExpiredSubmissions,
  findSubmissionsForRetry,
  upsertSubmission,
} from "./store";
import type { ChainLedgerEvent } from "./types";

export type WorkerResult = {
  retried: number;
  succeeded: number;
  expired: number;
  errors: string[];
};

export async function runEisWorker(): Promise<WorkerResult> {
  const result: WorkerResult = { retried: 0, succeeded: 0, expired: 0, errors: [] };

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

  try {
    const stale = await findSubmissionsForRetry();
    result.retried = stale.length;

    await Promise.allSettled(
      stale.map(async (sub) => {
        try {
          const hasPayload =
            Boolean(sub.jwsCompact) &&
            sub.payload != null &&
            typeof sub.payload === "object";

          const updated = hasPayload
            ? await submitPreparedSubmission(sub)
            : await processLedgerEvent({
                kind: sub.eventKind,
                referenceId: sub.referenceId,
                stellarTxHash: sub.stellarTxHash,
                amount: sub.payload?.totalAmountDue ?? sub.payload?.grossAmount ?? 0,
              } satisfies ChainLedgerEvent);

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
