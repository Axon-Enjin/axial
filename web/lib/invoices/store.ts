import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { deriveDemoLockbox } from "@/lib/msme/invoice-trust";
import { quoteAdvance } from "@/lib/soroban/quote";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  supabaseCountInvoices,
  supabaseGetInvoice,
  supabaseListInvoices,
  supabaseUpsertInvoice,
} from "@/lib/supabase/invoices-store";
import type { CollectionStatus, FactoringInvoice, InvoiceStatus } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "factoring-invoices.json");

export type InvoiceStoreBackend = "supabase" | "file";

export function getInvoiceStoreBackend(): InvoiceStoreBackend {
  return isSupabaseConfigured() ? "supabase" : "file";
}

function isMissingTableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  // Only fall back when the table is actually absent — not every error that
  // happens to mention the table name (those must surface, not hit /app/data).
  return (
    msg.includes("could not find the table") ||
    msg.includes("schema cache") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  );
}

async function withFileFallback<T>(
  supabaseOp: () => Promise<T>,
  fileOp: () => Promise<T>,
): Promise<T> {
  if (!isSupabaseConfigured()) {
    return fileOp();
  }
  try {
    return await supabaseOp();
  } catch (err) {
    if (isMissingTableError(err)) {
      return fileOp();
    }
    throw err;
  }
}

type StoreFile = {
  invoices: FactoringInvoice[];
};

function normalizeInvoice(inv: FactoringInvoice): FactoringInvoice {
  return {
    ...inv,
    faceUsdc: inv.faceUsdc ?? null,
    attributedInflowUsdc: inv.attributedInflowUsdc ?? null,
  };
}

async function readFileStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    return { invoices: (parsed.invoices ?? []).map(normalizeInvoice) };
  } catch {
    return { invoices: [] };
  }
}

async function writeFileStore(data: StoreFile) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

function sortInvoices(rows: FactoringInvoice[]): FactoringInvoice[] {
  return [...rows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getInvoice(id: string): Promise<FactoringInvoice | null> {
  return withFileFallback(
    () => supabaseGetInvoice(id),
    async () => {
      const store = await readFileStore();
      return store.invoices.find((i) => i.id === id) ?? null;
    },
  );
}

export async function listInvoices(
  page: number,
  pageSize: number,
): Promise<{ items: FactoringInvoice[]; total: number }> {
  const safePage = Math.max(1, page);
  const safeSize = Math.min(50, Math.max(1, pageSize));

  return withFileFallback(
    () => supabaseListInvoices(safePage, safeSize),
    async () => {
      const store = await readFileStore();
      const sorted = sortInvoices(store.invoices);
      const total = sorted.length;
      const start = (safePage - 1) * safeSize;
      return {
        items: sorted.slice(start, start + safeSize),
        total,
      };
    },
  );
}

export async function countInvoices(): Promise<number> {
  return withFileFallback(
    () => supabaseCountInvoices(),
    async () => {
      const store = await readFileStore();
      return store.invoices.length;
    },
  );
}

export async function upsertInvoice(inv: FactoringInvoice): Promise<FactoringInvoice> {
  const normalized = normalizeInvoice(inv);
  return withFileFallback(
    () => supabaseUpsertInvoice(normalized),
    async () => {
      const store = await readFileStore();
      const idx = store.invoices.findIndex((i) => i.id === normalized.id);
      if (idx >= 0) {
        store.invoices[idx] = normalized;
      } else {
        store.invoices.unshift(normalized);
      }
      await writeFileStore(store);
      return normalized;
    },
  );
}

function faceRewriteBlocked(existing: FactoringInvoice): boolean {
  return (
    existing.status === "fundable" ||
    existing.status === "settled" ||
    existing.payerConfirmed ||
    existing.noaAcknowledged
  );
}

export async function upsertFromParse(fields: {
  invoiceId: string;
  party: string;
  terms: string;
  face: number;
}): Promise<FactoringInvoice> {
  const { advance } = quoteAdvance(fields.face);
  const now = new Date().toISOString();
  const existing = await getInvoice(fields.invoiceId);

  if (existing && faceRewriteBlocked(existing)) {
    return existing;
  }

  const inv: FactoringInvoice = {
    id: fields.invoiceId,
    party: fields.party,
    terms: fields.terms,
    face: fields.face,
    faceUsdc: null,
    attributedInflowUsdc: null,
    immediate: advance,
    status: "awaiting_payer",
    payerConfirmed: false,
    noaAcknowledged: false,
    lockboxAddress: null,
    lockboxMemo: null,
    collectionStatus: "awaiting_payer",
    mintTxHash: null,
    swapTxHash: null,
    onChainInvoiceId: null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  return upsertInvoice(inv);
}

export async function confirmPayerInvoice(id: string): Promise<FactoringInvoice> {
  const existing = await getInvoice(id);
  if (!existing) {
    throw new Error("Invoice not found");
  }
  const { address, memo } = deriveDemoLockbox(id);
  const now = new Date().toISOString();
  return upsertInvoice({
    ...existing,
    status: "fundable",
    payerConfirmed: true,
    noaAcknowledged: true,
    lockboxAddress: address,
    lockboxMemo: memo,
    collectionStatus: "awaiting_payer",
    updatedAt: now,
  });
}

export async function settleInvoice(
  id: string,
  patch: {
    immediate: number;
    mintTxHash?: string | null;
    swapTxHash?: string | null;
    onChainInvoiceId?: string | null;
    faceUsdc?: number | null;
  },
): Promise<FactoringInvoice> {
  const existing = await getInvoice(id);
  if (!existing) {
    throw new Error("Invoice not found");
  }
  const now = new Date().toISOString();
  return upsertInvoice({
    ...existing,
    status: "settled",
    immediate: patch.immediate,
    mintTxHash: patch.mintTxHash ?? null,
    swapTxHash: patch.swapTxHash ?? null,
    onChainInvoiceId: patch.onChainInvoiceId ?? existing.onChainInvoiceId ?? null,
    faceUsdc: patch.faceUsdc ?? existing.faceUsdc,
    collectionStatus: "open",
    updatedAt: now,
  });
}

export async function attributeLockboxInflow(
  id: string,
  usdc: number,
): Promise<FactoringInvoice> {
  const existing = await getInvoice(id);
  if (!existing) {
    throw new Error("Invoice not found");
  }
  const amount = Math.max(0, Math.trunc(usdc));
  const now = new Date().toISOString();
  return upsertInvoice({
    ...existing,
    faceUsdc: existing.faceUsdc ?? amount,
    attributedInflowUsdc: (existing.attributedInflowUsdc ?? 0) + amount,
    updatedAt: now,
  });
}

export async function setInvoiceFaceUsdc(
  id: string,
  faceUsdc: number,
): Promise<FactoringInvoice> {
  const existing = await getInvoice(id);
  if (!existing) {
    throw new Error("Invoice not found");
  }
  if (existing.faceUsdc != null) {
    return existing;
  }
  return upsertInvoice({
    ...existing,
    faceUsdc: Math.max(0, Math.trunc(faceUsdc)),
    updatedAt: new Date().toISOString(),
  });
}

export async function beginCollectingInvoice(id: string): Promise<FactoringInvoice> {
  const existing = await getInvoice(id);
  if (!existing) {
    throw new Error("Invoice not found");
  }
  if (existing.collectionStatus === "collected") {
    throw new Error("Invoice already collected");
  }
  if (existing.collectionStatus === "settling") {
    return existing;
  }
  return upsertInvoice({
    ...existing,
    collectionStatus: "settling",
    updatedAt: new Date().toISOString(),
  });
}

export async function revertCollectingInvoice(
  id: string,
  to: CollectionStatus = "open",
): Promise<FactoringInvoice> {
  const existing = await getInvoice(id);
  if (!existing) {
    throw new Error("Invoice not found");
  }
  return upsertInvoice({
    ...existing,
    collectionStatus: to,
    updatedAt: new Date().toISOString(),
  });
}

export async function markCollectedInvoice(id: string): Promise<FactoringInvoice> {
  const existing = await getInvoice(id);
  if (!existing) {
    throw new Error("Invoice not found");
  }
  const now = new Date().toISOString();
  return upsertInvoice({
    ...existing,
    collectionStatus: "collected" as CollectionStatus,
    updatedAt: now,
  });
}

export function buildSeedInvoice(
  seed: {
    id: string;
    party: string;
    terms: string;
    face: number;
    status: InvoiceStatus;
    payerConfirmed?: boolean;
    noaAcknowledged?: boolean;
    collectionStatus?: CollectionStatus;
    mintTxHash?: string | null;
    swapTxHash?: string | null;
    faceUsdc?: number | null;
    attributedInflowUsdc?: number | null;
  },
  offsetMinutes: number,
): FactoringInvoice {
  const { advance } = quoteAdvance(seed.face);
  const { address, memo } = deriveDemoLockbox(seed.id);
  const confirmed = seed.payerConfirmed ?? seed.status !== "awaiting_payer";
  const ts = new Date(Date.now() - offsetMinutes * 60_000).toISOString();

  return {
    id: seed.id,
    party: seed.party,
    terms: seed.terms,
    face: seed.face,
    faceUsdc: seed.faceUsdc ?? null,
    attributedInflowUsdc: seed.attributedInflowUsdc ?? null,
    immediate: seed.status === "settled" ? advance : seed.status === "fundable" ? advance : advance,
    status: seed.status,
    payerConfirmed: confirmed,
    noaAcknowledged: seed.noaAcknowledged ?? confirmed,
    lockboxAddress: confirmed ? address : null,
    lockboxMemo: confirmed ? memo : null,
    collectionStatus:
      seed.collectionStatus ??
      (seed.status === "settled" ? "open" : "awaiting_payer"),
    mintTxHash: seed.mintTxHash ?? null,
    swapTxHash: seed.swapTxHash ?? null,
    onChainInvoiceId: null,
    createdAt: ts,
    updatedAt: ts,
  };
}
