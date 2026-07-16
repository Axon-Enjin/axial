import { getBirEisClient } from "./bir-client";
import { signEisPayload } from "./jws";
import { writeBirMemoToStellar } from "./memo";
import { mapLedgerEventToEisPayload } from "./schema";
import {
  buildIdempotencyKey,
  findByIdempotencyKey,
  newPayloadId,
  upsertSubmission,
} from "./store";
import { emitEisFailed } from "@/lib/notifications/emit";
import { resolveOrgId } from "@/lib/org/store";
import type { ChainLedgerEvent, EisSubmission, EisSubmissionStatus } from "./types";

/** Statuses that must not re-sign or re-submit to BIR. */
const PREPARE_SKIP_STATUSES: ReadonlySet<EisSubmissionStatus> = new Set([
  "prepared",
  "submitted",
  "acknowledged",
  "memo_written",
]);

const SUBMIT_REFUSED_STATUSES: ReadonlySet<EisSubmissionStatus> = new Set([
  "submitted",
  "acknowledged",
  "memo_written",
]);

const SUBMIT_ALLOWED_STATUSES: ReadonlySet<EisSubmissionStatus> = new Set([
  "prepared",
  "failed",
  "queued",
]);

function dueByFromInvoiceDate(invoiceDate: string): string {
  const d = new Date(`${invoiceDate}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  }
  d.setUTCDate(d.getUTCDate() + 3);
  return d.toISOString();
}

function shouldDemoAutoAck(): boolean {
  return (
    (process.env.AXIAL_ALLOW_SEED === "true" ||
      process.env.EIS_DEMO_AUTO_ACK === "true") &&
    process.env.BIR_EIS_LIVE !== "true"
  );
}

/**
 * Prepare-only path: map payload, sign JWS, persist as `prepared`.
 * Does not call BIR unless demo auto-ack is enabled.
 */
export async function processLedgerEvent(
  event: ChainLedgerEvent,
): Promise<EisSubmission> {
  const orgId = resolveOrgId();
  const idempotencyKey = buildIdempotencyKey(
    orgId,
    event.stellarTxHash,
    event.referenceId,
  );

  const existing = await findByIdempotencyKey(idempotencyKey);
  if (existing && PREPARE_SKIP_STATUSES.has(existing.status)) {
    return existing;
  }

  const now = new Date().toISOString();
  const payloadId = existing?.payloadId ?? newPayloadId();
  const payload = await mapLedgerEventToEisPayload(event, orgId);
  const jwsCompact = signEisPayload(payload);
  const dueBy = existing?.dueBy ?? dueByFromInvoiceDate(payload.invoiceDate);

  let sub: EisSubmission = existing ?? {
    id: crypto.randomUUID(),
    payloadId,
    idempotencyKey,
    status: "prepared",
    eventKind: event.kind,
    referenceId: event.referenceId,
    stellarTxHash: event.stellarTxHash,
    birReferenceId: null,
    memoTxHash: null,
    memoText: null,
    jwsCompact,
    payload,
    createdAt: now,
    updatedAt: now,
    dueBy,
  };

  sub.payload = payload;
  sub.jwsCompact = jwsCompact;
  sub.status = "prepared";
  sub.dueBy = dueBy;
  sub.error = undefined;
  sub.updatedAt = now;
  sub = await upsertSubmission(sub);

  if (shouldDemoAutoAck()) {
    return submitPreparedSubmission(sub);
  }

  return sub;
}

/**
 * Human-approved (or worker-retry) BIR submit + memo write-back.
 * Allowed from prepared | failed | legacy queued only.
 */
export async function submitPreparedSubmission(
  sub: EisSubmission,
): Promise<EisSubmission> {
  if (SUBMIT_REFUSED_STATUSES.has(sub.status)) {
    return sub;
  }
  if (!SUBMIT_ALLOWED_STATUSES.has(sub.status)) {
    throw new Error(
      `Cannot submit EIS payload from status "${sub.status}" — expected prepared, failed, or queued`,
    );
  }

  const orgId = resolveOrgId();
  const birClient = getBirEisClient();
  let current = { ...sub };

  try {
    current.status = "submitted";
    current.submittedAt = new Date().toISOString();
    current.error = undefined;
    current.updatedAt = new Date().toISOString();
    current = await upsertSubmission(current);

    const ack = await birClient.submit(current.jwsCompact, current.payloadId);
    current.status = "acknowledged";
    current.birReferenceId = ack.birReferenceId;
    current.updatedAt = new Date().toISOString();
    current = await upsertSubmission(current);

    try {
      const memo = await writeBirMemoToStellar(
        ack.birReferenceId,
        current.stellarTxHash,
        "mainnet",
      );
      current.memoTxHash = memo.memoTxHash;
      current.memoText = memo.memoText;
      current.status = "memo_written";
    } catch (memoErr) {
      current.error =
        memoErr instanceof Error ? memoErr.message : "Memo write-back failed";
    }

    current.updatedAt = new Date().toISOString();
    return await upsertSubmission(current);
  } catch (err) {
    current.status = "failed";
    current.error = err instanceof Error ? err.message : "EIS submission failed";
    current.updatedAt = new Date().toISOString();
    emitEisFailed(orgId, current.referenceId);
    return await upsertSubmission(current);
  }
}

/** Fire-and-forget from on-chain API routes (do not block user response). */
export function enqueueEisProcessing(event: ChainLedgerEvent): void {
  void processLedgerEvent(event).catch((err) => {
    console.error("[eis/oracle]", err);
  });
}
