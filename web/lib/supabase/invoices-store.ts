import { getSupabaseAdmin } from "./client";
import type { CollectionStatus, FactoringInvoice, InvoiceStatus } from "@/lib/invoices/types";

type InvoiceRow = {
  id: string;
  party: string;
  terms: string;
  face: number;
  immediate: number | null;
  status: InvoiceStatus;
  payer_confirmed: boolean;
  noa_acknowledged: boolean;
  lockbox_address: string | null;
  lockbox_memo: string | null;
  collection_status: CollectionStatus;
  mint_tx_hash: string | null;
  swap_tx_hash: string | null;
  on_chain_invoice_id: string | null;
  created_at: string;
  updated_at: string;
};

function rowToInvoice(row: InvoiceRow): FactoringInvoice {
  return {
    id: row.id,
    party: row.party,
    terms: row.terms,
    face: Number(row.face),
    immediate: row.immediate != null ? Number(row.immediate) : null,
    status: row.status,
    payerConfirmed: row.payer_confirmed,
    noaAcknowledged: row.noa_acknowledged,
    lockboxAddress: row.lockbox_address,
    lockboxMemo: row.lockbox_memo,
    collectionStatus: row.collection_status,
    mintTxHash: row.mint_tx_hash,
    swapTxHash: row.swap_tx_hash,
    onChainInvoiceId: row.on_chain_invoice_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function invoiceToRow(inv: FactoringInvoice): InvoiceRow {
  return {
    id: inv.id,
    party: inv.party,
    terms: inv.terms,
    face: inv.face,
    immediate: inv.immediate,
    status: inv.status,
    payer_confirmed: inv.payerConfirmed,
    noa_acknowledged: inv.noaAcknowledged,
    lockbox_address: inv.lockboxAddress,
    lockbox_memo: inv.lockboxMemo,
    collection_status: inv.collectionStatus,
    mint_tx_hash: inv.mintTxHash,
    swap_tx_hash: inv.swapTxHash,
    on_chain_invoice_id: inv.onChainInvoiceId,
    created_at: inv.createdAt,
    updated_at: inv.updatedAt,
  };
}

export async function supabaseGetInvoice(id: string): Promise<FactoringInvoice | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("factoring_invoices")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase get invoice failed: ${error.message}`);
  }
  return data ? rowToInvoice(data as InvoiceRow) : null;
}

export async function supabaseListInvoices(
  page: number,
  pageSize: number,
): Promise<{ items: FactoringInvoice[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await getSupabaseAdmin()
    .from("factoring_invoices")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Supabase list invoices failed: ${error.message}`);
  }

  return {
    items: (data as InvoiceRow[]).map(rowToInvoice),
    total: count ?? 0,
  };
}

export async function supabaseUpsertInvoice(inv: FactoringInvoice): Promise<FactoringInvoice> {
  const row = invoiceToRow(inv);
  const { data, error } = await getSupabaseAdmin()
    .from("factoring_invoices")
    .upsert(row, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Supabase upsert invoice failed: ${error.message}`);
  }
  return rowToInvoice(data as InvoiceRow);
}

export async function supabaseCountInvoices(): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from("factoring_invoices")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw new Error(`Supabase count failed: ${error.message}`);
  }
  return count ?? 0;
}
