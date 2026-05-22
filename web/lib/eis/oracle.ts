import { acknowledgeEisSubmission } from "./bir-mock";
import { signEisPayloadMock } from "./jws";
import { writeBirMemoToStellar } from "./memo";
import { mapLedgerEventToEisPayload } from "./schema";
import {
  buildIdempotencyKey,
  findByIdempotencyKey,
  newPayloadId,
  upsertSubmission,
} from "./store";
import type { ChainLedgerEvent, EisSubmission } from "./types";

const ORG_ID = process.env.AXIAL_ORG_ID ?? "demo-msme";

export async function processLedgerEvent(
  event: ChainLedgerEvent,
): Promise<EisSubmission> {
  const idempotencyKey = buildIdempotencyKey(
    ORG_ID,
    event.stellarTxHash,
    event.referenceId,
  );

  const existing = await findByIdempotencyKey(idempotencyKey);
  if (existing?.status === "memo_written") {
    return existing;
  }

  const now = new Date().toISOString();
  const payloadId = existing?.payloadId ?? newPayloadId();
  const payload = mapLedgerEventToEisPayload(event);
  const jwsCompact = signEisPayloadMock(payload);

  // T+3 deadline: BIR EIS must be received within 3 calendar days of the transaction
  const dueBy = existing?.dueBy ?? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  let sub: EisSubmission = existing ?? {
    id: crypto.randomUUID(),
    payloadId,
    idempotencyKey,
    status: "queued",
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
  sub.updatedAt = now;

  try {
    sub.status = "submitted";
    sub.submittedAt = new Date().toISOString();
    sub = await upsertSubmission(sub);

    const ack = acknowledgeEisSubmission(jwsCompact, payloadId);
    sub.status = "acknowledged";
    sub.birReferenceId = ack.birReferenceId;
    sub.updatedAt = new Date().toISOString();
    sub = await upsertSubmission(sub);

    try {
      const memo = await writeBirMemoToStellar(ack.birReferenceId, event.stellarTxHash);
      sub.memoTxHash = memo.memoTxHash;
      sub.memoText = memo.memoText;
      sub.status = "memo_written";
    } catch (memoErr) {
      sub.error =
        memoErr instanceof Error ? memoErr.message : "Memo write-back failed";
      // Keep acknowledged — BIR accept succeeded
    }

    sub.updatedAt = new Date().toISOString();
    return await upsertSubmission(sub);
  } catch (err) {
    sub.status = "failed";
    sub.error = err instanceof Error ? err.message : "EIS submission failed";
    sub.updatedAt = new Date().toISOString();
    return await upsertSubmission(sub);
  }
}

/** Fire-and-forget from on-chain API routes (do not block user response). */
export function enqueueEisProcessing(event: ChainLedgerEvent): void {
  void processLedgerEvent(event).catch((err) => {
    console.error("[eis/oracle]", err);
  });
}
