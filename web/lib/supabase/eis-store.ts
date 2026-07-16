import { getSupabaseAdmin } from "./client";
import type { BirEisPayload, EisSubmission, EisSubmissionStatus } from "@/lib/eis/types";

type EisRow = {
  id: string;
  payload_id: string;
  idempotency_key: string;
  status: EisSubmissionStatus;
  event_kind: EisSubmission["eventKind"];
  reference_id: string;
  stellar_tx_hash: string;
  bir_reference_id: string | null;
  memo_tx_hash: string | null;
  memo_text: string | null;
  jws_compact: string;
  payload: BirEisPayload;
  error: string | null;
  created_at: string;
  updated_at: string;
  due_by: string | null;
  submitted_at: string | null;
};

function rowToSubmission(row: EisRow): EisSubmission {
  return {
    id: row.id,
    payloadId: row.payload_id,
    idempotencyKey: row.idempotency_key,
    status: row.status,
    eventKind: row.event_kind,
    referenceId: row.reference_id,
    stellarTxHash: row.stellar_tx_hash,
    birReferenceId: row.bir_reference_id,
    memoTxHash: row.memo_tx_hash,
    memoText: row.memo_text,
    jwsCompact: row.jws_compact,
    payload: row.payload,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    error: row.error ?? undefined,
    dueBy: row.due_by ?? undefined,
    submittedAt: row.submitted_at ?? undefined,
  };
}

function submissionToRow(sub: EisSubmission): Omit<EisRow, "created_at" | "updated_at"> & {
  updated_at: string;
} {
  return {
    id: sub.id,
    payload_id: sub.payloadId,
    idempotency_key: sub.idempotencyKey,
    status: sub.status,
    event_kind: sub.eventKind,
    reference_id: sub.referenceId,
    stellar_tx_hash: sub.stellarTxHash,
    bir_reference_id: sub.birReferenceId,
    memo_tx_hash: sub.memoTxHash,
    memo_text: sub.memoText,
    jws_compact: sub.jwsCompact,
    payload: sub.payload,
    error: sub.error ?? null,
    updated_at: sub.updatedAt,
    due_by: sub.dueBy ?? null,
    submitted_at: sub.submittedAt ?? null,
  };
}

export async function supabaseFindByIdempotencyKey(
  key: string,
): Promise<EisSubmission | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("eis_submissions")
    .select("*")
    .eq("idempotency_key", key)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase find failed: ${error.message}`);
  }
  return data ? rowToSubmission(data as EisRow) : null;
}

export async function supabaseFindById(
  id: string,
): Promise<EisSubmission | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("eis_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase find by id failed: ${error.message}`);
  }
  return data ? rowToSubmission(data as EisRow) : null;
}

export async function supabaseFindByPayloadId(
  payloadId: string,
): Promise<EisSubmission | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("eis_submissions")
    .select("*")
    .eq("payload_id", payloadId)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase find by payloadId failed: ${error.message}`);
  }
  return data ? rowToSubmission(data as EisRow) : null;
}

export async function supabaseListSubmissions(
  limit = 50,
): Promise<EisSubmission[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("eis_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Supabase list failed: ${error.message}`);
  }
  return (data as EisRow[]).map(rowToSubmission);
}

export async function supabaseUpsertSubmission(
  sub: EisSubmission,
): Promise<EisSubmission> {
  const row = submissionToRow(sub);
  const { data, error } = await getSupabaseAdmin()
    .from("eis_submissions")
    .upsert(row, { onConflict: "idempotency_key" })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }
  return rowToSubmission(data as EisRow);
}
