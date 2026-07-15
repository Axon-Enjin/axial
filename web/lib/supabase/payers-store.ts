import { getSupabaseAdmin } from "./client";
import type {
  InvoiceConfirmation,
  KybStatus,
  NoticeOfAssignment,
  Payer,
} from "@/lib/payers/types";

// ── Row types (snake_case) ────────────────────────────────────────────────────

type PayerRow = {
  id: string;
  org_id: string;
  legal_name: string;
  tin: string;
  contact_email: string;
  kyb_status: KybStatus;
  kyb_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

type ConfirmationRow = {
  id: string;
  receivable_id: string;
  payer_id: string;
  confirmed_amount: number;
  due_date: string;
  status: string;
  auth_token: string;
  confirmed_at: string | null;
  dispute_reason: string | null;
  disputed_at: string | null;
  created_at: string;
  updated_at: string;
};

type NoaRow = {
  id: string;
  receivable_id: string;
  payer_id: string;
  noa_document_ref: string;
  lockbox_address: string;
  ack_status: string;
  ack_method: string | null;
  acknowledged_at: string | null;
  created_at: string;
  updated_at: string;
};

// ── Mappers ───────────────────────────────────────────────────────────────────

function rowToPayer(row: PayerRow): Payer {
  return {
    id: row.id,
    orgId: row.org_id,
    legalName: row.legal_name,
    tin: row.tin,
    contactEmail: row.contact_email,
    kybStatus: row.kyb_status,
    kybVerifiedAt: row.kyb_verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToConfirmation(row: ConfirmationRow): InvoiceConfirmation {
  return {
    id: row.id,
    receivableId: row.receivable_id,
    payerId: row.payer_id,
    confirmedAmount: Number(row.confirmed_amount),
    dueDate: row.due_date,
    status: row.status as InvoiceConfirmation["status"],
    authToken: row.auth_token,
    confirmedAt: row.confirmed_at,
    disputeReason: row.dispute_reason ?? null,
    disputedAt: row.disputed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToNoa(row: NoaRow): NoticeOfAssignment {
  return {
    id: row.id,
    receivableId: row.receivable_id,
    payerId: row.payer_id,
    noaDocumentRef: row.noa_document_ref,
    lockboxAddress: row.lockbox_address,
    ackStatus: row.ack_status as NoticeOfAssignment["ackStatus"],
    ackMethod: row.ack_method as NoticeOfAssignment["ackMethod"],
    acknowledgedAt: row.acknowledged_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Payers ────────────────────────────────────────────────────────────────────

export async function supabaseCreatePayer(payer: Payer): Promise<Payer> {
  const { data, error } = await getSupabaseAdmin()
    .from("payers")
    .insert({
      id: payer.id,
      org_id: payer.orgId,
      legal_name: payer.legalName,
      tin: payer.tin,
      contact_email: payer.contactEmail,
      kyb_status: payer.kybStatus,
      kyb_verified_at: payer.kybVerifiedAt,
      created_at: payer.createdAt,
      updated_at: payer.updatedAt,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Supabase create payer failed: ${error.message}`);
  return rowToPayer(data as PayerRow);
}

export async function supabaseGetPayer(id: string): Promise<Payer | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("payers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Supabase get payer failed: ${error.message}`);
  return data ? rowToPayer(data as PayerRow) : null;
}

export async function supabaseListPayersByOrg(orgId: string): Promise<Payer[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("payers")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Supabase list payers failed: ${error.message}`);
  return (data as PayerRow[]).map(rowToPayer);
}

export async function supabaseUpdatePayer(
  id: string,
  patch: Partial<{
    kybStatus: string;
    kybVerifiedAt: string | null;
    updatedAt: string;
  }>,
): Promise<Payer> {
  const row: Record<string, unknown> = {};
  if (patch.kybStatus !== undefined) row.kyb_status = patch.kybStatus;
  if (patch.kybVerifiedAt !== undefined) row.kyb_verified_at = patch.kybVerifiedAt;
  if (patch.updatedAt !== undefined) row.updated_at = patch.updatedAt;

  const { data, error } = await getSupabaseAdmin()
    .from("payers")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Supabase update payer failed: ${error.message}`);
  return rowToPayer(data as PayerRow);
}

// ── Confirmations ─────────────────────────────────────────────────────────────

export async function supabaseCreateConfirmation(
  c: InvoiceConfirmation,
): Promise<InvoiceConfirmation> {
  const { data, error } = await getSupabaseAdmin()
    .from("invoice_confirmations")
    .upsert(
      {
        id: c.id,
        receivable_id: c.receivableId,
        payer_id: c.payerId,
        confirmed_amount: c.confirmedAmount,
        due_date: c.dueDate,
        status: c.status,
        auth_token: c.authToken,
        confirmed_at: c.confirmedAt,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      },
      { onConflict: "receivable_id" },
    )
    .select("*")
    .single();

  if (error) throw new Error(`Supabase create confirmation failed: ${error.message}`);
  return rowToConfirmation(data as ConfirmationRow);
}

export async function supabaseGetConfirmationByReceivable(
  receivableId: string,
): Promise<InvoiceConfirmation | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("invoice_confirmations")
    .select("*")
    .eq("receivable_id", receivableId)
    .maybeSingle();

  if (error)
    throw new Error(`Supabase get confirmation failed: ${error.message}`);
  return data ? rowToConfirmation(data as ConfirmationRow) : null;
}

export async function supabaseGetConfirmationByToken(
  token: string,
): Promise<InvoiceConfirmation | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("invoice_confirmations")
    .select("*")
    .eq("auth_token", token)
    .maybeSingle();

  if (error)
    throw new Error(`Supabase get confirmation by token failed: ${error.message}`);
  return data ? rowToConfirmation(data as ConfirmationRow) : null;
}

export async function supabaseUpdateConfirmation(
  id: string,
  patch: Partial<InvoiceConfirmation>,
): Promise<InvoiceConfirmation> {
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.confirmedAt !== undefined) row.confirmed_at = patch.confirmedAt;
  if (patch.updatedAt !== undefined) row.updated_at = patch.updatedAt;

  const { data, error } = await getSupabaseAdmin()
    .from("invoice_confirmations")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();

  if (error)
    throw new Error(`Supabase update confirmation failed: ${error.message}`);
  return rowToConfirmation(data as ConfirmationRow);
}

// ── Notices of Assignment ─────────────────────────────────────────────────────

export async function supabaseCreateNoa(
  noa: NoticeOfAssignment,
): Promise<NoticeOfAssignment> {
  const { data, error } = await getSupabaseAdmin()
    .from("notices_of_assignment")
    .upsert(
      {
        id: noa.id,
        receivable_id: noa.receivableId,
        payer_id: noa.payerId,
        noa_document_ref: noa.noaDocumentRef,
        lockbox_address: noa.lockboxAddress,
        ack_status: noa.ackStatus,
        ack_method: noa.ackMethod,
        acknowledged_at: noa.acknowledgedAt,
        created_at: noa.createdAt,
        updated_at: noa.updatedAt,
      },
      { onConflict: "receivable_id" },
    )
    .select("*")
    .single();

  if (error) throw new Error(`Supabase create NoA failed: ${error.message}`);
  return rowToNoa(data as NoaRow);
}

export async function supabaseGetNoaByReceivable(
  receivableId: string,
): Promise<NoticeOfAssignment | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("notices_of_assignment")
    .select("*")
    .eq("receivable_id", receivableId)
    .maybeSingle();

  if (error) throw new Error(`Supabase get NoA failed: ${error.message}`);
  return data ? rowToNoa(data as NoaRow) : null;
}

export async function supabaseUpdateNoa(
  id: string,
  patch: Partial<NoticeOfAssignment>,
): Promise<NoticeOfAssignment> {
  const row: Record<string, unknown> = {};
  if (patch.ackStatus !== undefined) row.ack_status = patch.ackStatus;
  if (patch.ackMethod !== undefined) row.ack_method = patch.ackMethod;
  if (patch.acknowledgedAt !== undefined) row.acknowledged_at = patch.acknowledgedAt;
  if (patch.updatedAt !== undefined) row.updated_at = patch.updatedAt;

  const { data, error } = await getSupabaseAdmin()
    .from("notices_of_assignment")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Supabase update NoA failed: ${error.message}`);
  return rowToNoa(data as NoaRow);
}
