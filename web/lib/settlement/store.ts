import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { isSupabaseConfigured, getSupabaseAdmin } from "@/lib/supabase/client";
import type { RecourseStatus, ReserveLedgerEntry } from "./types";
import { randomBytes } from "node:crypto";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "reserve-ledger.json");

type StoreFile = { entries: ReserveLedgerEntry[] };

function newId(): string {
  return randomBytes(16).toString("hex");
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreFile;
  } catch {
    return { entries: [] };
  }
}

async function writeStore(data: StoreFile): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

function isMissingTableError(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.message.includes("Could not find the table") ||
      err.message.includes("reserve_ledger"))
  );
}

async function withFallback<T>(
  supabaseOp: () => Promise<T>,
  fileOp: () => Promise<T>,
): Promise<T> {
  if (!isSupabaseConfigured()) return fileOp();
  try {
    return await supabaseOp();
  } catch (err) {
    if (isMissingTableError(err)) return fileOp();
    throw err;
  }
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function upsertReserveEntry(
  data: Omit<ReserveLedgerEntry, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  },
): Promise<ReserveLedgerEntry> {
  const now = new Date().toISOString();
  const entry: ReserveLedgerEntry = {
    id: data.id ?? newId(),
    createdAt: now,
    updatedAt: now,
    ...data,
    settlementTxHash: data.settlementTxHash ?? null,
    collectedAmount: data.collectedAmount ?? null,
    leakageDetectedAt: data.leakageDetectedAt ?? null,
    releasedAt: data.releasedAt ?? null,
  };

  return withFallback(
    async () => {
      const row = entryToRow(entry);
      const { data: saved, error } = await getSupabaseAdmin()
        .from("reserve_ledger")
        .upsert(row, { onConflict: "receivable_id" })
        .select("*")
        .single();
      if (error) throw new Error(`Supabase upsert reserve entry: ${error.message}`);
      return rowToEntry(saved as RowType);
    },
    async () => {
      const store = await readStore();
      const idx = store.entries.findIndex((e) => e.receivableId === data.receivableId);
      if (idx >= 0) {
        store.entries[idx] = { ...store.entries[idx]!, ...entry, updatedAt: now };
        await writeStore(store);
        return store.entries[idx]!;
      }
      store.entries.unshift(entry);
      await writeStore(store);
      return entry;
    },
  );
}

export async function getReserveEntry(receivableId: string): Promise<ReserveLedgerEntry | null> {
  return withFallback(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("reserve_ledger")
        .select("*")
        .eq("receivable_id", receivableId)
        .maybeSingle();
      if (error) throw new Error(`Supabase get reserve entry: ${error.message}`);
      return data ? rowToEntry(data as RowType) : null;
    },
    async () => {
      const store = await readStore();
      return store.entries.find((e) => e.receivableId === receivableId) ?? null;
    },
  );
}

export async function listOpenEntries(): Promise<ReserveLedgerEntry[]> {
  return withFallback(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("reserve_ledger")
        .select("*")
        .eq("recourse_status", "none")
        .is("released_at", null)
        .order("created_at", { ascending: true });
      if (error) throw new Error(`Supabase list open entries: ${error.message}`);
      return (data as RowType[]).map(rowToEntry);
    },
    async () => {
      const store = await readStore();
      return store.entries.filter(
        (e) => e.recourseStatus === "none" && !e.releasedAt,
      );
    },
  );
}

export async function markEntryLeaked(
  receivableId: string,
): Promise<ReserveLedgerEntry> {
  const now = new Date().toISOString();
  const entry = await getReserveEntry(receivableId);
  if (!entry) throw new Error(`Reserve entry not found: ${receivableId}`);

  return upsertReserveEntry({
    ...entry,
    recourseStatus: "triggered" as RecourseStatus,
    leakageDetectedAt: now,
  });
}

export async function markEntrySettled(
  receivableId: string,
  data: { collectedAmount: number; settlementTxHash?: string },
): Promise<ReserveLedgerEntry> {
  const now = new Date().toISOString();
  const entry = await getReserveEntry(receivableId);
  if (!entry) throw new Error(`Reserve entry not found: ${receivableId}`);

  const shortfall = Math.max(0, entry.advanceAmount - data.collectedAmount);
  return upsertReserveEntry({
    ...entry,
    collectedAmount: data.collectedAmount,
    shortfall,
    settlementTxHash: data.settlementTxHash ?? null,
    recourseStatus: shortfall > 0 ? "triggered" : "none",
    releasedAt: shortfall === 0 ? now : null,
  });
}

// ── Row mappers ───────────────────────────────────────────────────────────────

type RowType = {
  id: string;
  receivable_id: string;
  face_amount: string | number;
  advance_amount: string | number;
  reserve_held: string | number;
  funder_address: string;
  msme_address: string;
  lockbox_address: string;
  settlement_tx_hash: string | null;
  collected_amount: string | number | null;
  shortfall: string | number;
  due_date: string | null;
  recourse_status: RecourseStatus;
  leakage_detected_at: string | null;
  released_at: string | null;
  created_at: string;
  updated_at: string;
};

function rowToEntry(row: RowType): ReserveLedgerEntry {
  return {
    id: row.id,
    receivableId: row.receivable_id,
    faceAmount: Number(row.face_amount),
    advanceAmount: Number(row.advance_amount),
    reserveHeld: Number(row.reserve_held),
    funderAddress: row.funder_address,
    msmeAddress: row.msme_address,
    lockboxAddress: row.lockbox_address,
    settlementTxHash: row.settlement_tx_hash,
    collectedAmount: row.collected_amount != null ? Number(row.collected_amount) : null,
    shortfall: Number(row.shortfall),
    dueDate: row.due_date,
    recourseStatus: row.recourse_status,
    leakageDetectedAt: row.leakage_detected_at,
    releasedAt: row.released_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function entryToRow(e: ReserveLedgerEntry): RowType {
  return {
    id: e.id,
    receivable_id: e.receivableId,
    face_amount: e.faceAmount,
    advance_amount: e.advanceAmount,
    reserve_held: e.reserveHeld,
    funder_address: e.funderAddress,
    msme_address: e.msmeAddress,
    lockbox_address: e.lockboxAddress,
    settlement_tx_hash: e.settlementTxHash,
    collected_amount: e.collectedAmount,
    shortfall: e.shortfall,
    due_date: e.dueDate,
    recourse_status: e.recourseStatus,
    leakage_detected_at: e.leakageDetectedAt,
    released_at: e.releasedAt,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  };
}
