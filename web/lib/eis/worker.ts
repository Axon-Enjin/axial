/**
 * T+3 BIR EIS submission worker.
 *
 * Expires prepared/failed/queued past dueBy (emits calm notification).
 * Nudges prepared rows within 24h of dueBy.
 * Retries failed only when BIR is not live (preserves Co-Pilot human gate).
 * Never auto-submits `prepared` — that awaits human approve.
 * Requeues aged stuck `submitted` rows as failed for human re-approve.
 */

import { processLedgerEvent, submitPreparedSubmission } from "./oracle";
import {
  findExpiredSubmissions,
  findSubmissionsForRetry,
  listSubmissions,
  upsertSubmission,
} from "./store";
import type { ChainLedgerEvent, EisSubmission } from "./types";
import { emitEisDueSoon, emitEisEscalate, emitEisExpired } from "@/lib/notifications/emit";
import { resolveOrgId } from "@/lib/org/store";

export type WorkerResult = {
  retried: number;
  succeeded: number;
  expired: number;
  dueSoon: number;
  escalated: number;
  requeuedSubmitted: number;
  errors: string[];
};

const STUCK_SUBMITTED_MS = 30 * 60 * 1000;
const DUE_SOON_MS = 24 * 60 * 60 * 1000;
const ESCALATE_AGE_MS = 24 * 60 * 60 * 1000;

function isBirLive(): boolean {
  return process.env.BIR_EIS_LIVE === "true";
}

export async function runEisWorker(): Promise<WorkerResult> {
  const result: WorkerResult = {
    retried: 0,
    succeeded: 0,
    expired: 0,
    dueSoon: 0,
    escalated: 0,
    requeuedSubmitted: 0,
    errors: [],
  };

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
        emitEisExpired(resolveOrgId(), sub.referenceId || sub.payloadId || sub.id);
        result.expired++;
      }),
    );
  } catch (err) {
    result.errors.push(`Expire sweep failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    const dueSoon = await findDueSoonPrepared();
    await Promise.allSettled(
      dueSoon.map(async (sub) => {
        emitEisDueSoon(resolveOrgId(), sub.referenceId || sub.payloadId || sub.id);
        result.dueSoon++;
      }),
    );
  } catch (err) {
    result.errors.push(`Due-soon sweep failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    const aged = await findAgedPreparedForEscalate();
    await Promise.allSettled(
      aged.map(async (sub) => {
        emitEisEscalate(resolveOrgId(), sub.referenceId || sub.payloadId || sub.id);
        result.escalated++;
      }),
    );
  } catch (err) {
    result.errors.push(
      `Escalate sweep failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  try {
    const stuck = await findStuckSubmitted();
    await Promise.allSettled(
      stuck.map(async (sub) => {
        const now = new Date().toISOString();
        await upsertSubmission({
          ...sub,
          status: "failed",
          error:
            "Submission left in submitted state without acknowledgement — re-approve to resume",
          updatedAt: now,
        });
        emitEisExpired(resolveOrgId(), sub.referenceId || sub.payloadId || sub.id);
        result.requeuedSubmitted++;
      }),
    );
  } catch (err) {
    result.errors.push(
      `Stuck-submitted sweep failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (isBirLive()) {
    return result;
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

async function findDueSoonPrepared(): Promise<EisSubmission[]> {
  const all = await listSubmissions(500);
  const now = Date.now();
  return all.filter((s) => {
    if (s.status !== "prepared" || !s.dueBy) return false;
    const due = Date.parse(s.dueBy);
    if (!Number.isFinite(due)) return false;
    const remaining = due - now;
    return remaining > 0 && remaining <= DUE_SOON_MS;
  });
}

/** Prepared filings unattended ≥24h — ghost-ship escalate to founder inbox. */
async function findAgedPreparedForEscalate(): Promise<EisSubmission[]> {
  const all = await listSubmissions(500);
  const cutoff = Date.now() - ESCALATE_AGE_MS;
  return all.filter((s) => {
    if (s.status !== "prepared") return false;
    const created = Date.parse(s.createdAt);
    return Number.isFinite(created) && created <= cutoff;
  });
}

async function findStuckSubmitted(): Promise<EisSubmission[]> {
  const all = await listSubmissions(500);
  const cutoff = Date.now() - STUCK_SUBMITTED_MS;
  return all.filter((s) => {
    if (s.status !== "submitted") return false;
    const updated = Date.parse(s.updatedAt ?? s.submittedAt ?? s.createdAt);
    return Number.isFinite(updated) && updated <= cutoff;
  });
}
