import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "pending-settlement-registrations.json");

export type PendingSettlementRegistration = {
  invoiceId: string;
  swapTxHash: string;
  faceUsdc: number;
  advance: number;
  attempts: number;
  nextAttemptAt: string;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
};

type StoreFile = { pending: PendingSettlementRegistration[] };

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreFile;
  } catch {
    return { pending: [] };
  }
}

async function writeStore(data: StoreFile): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function enqueuePendingRegistration(input: {
  invoiceId: string;
  swapTxHash: string;
  faceUsdc: number;
  advance: number;
  lastError?: string;
}): Promise<PendingSettlementRegistration> {
  const now = new Date().toISOString();
  const store = await readStore();
  const existing = store.pending.find((p) => p.invoiceId === input.invoiceId);
  const row: PendingSettlementRegistration = {
    invoiceId: input.invoiceId,
    swapTxHash: input.swapTxHash,
    faceUsdc: Math.trunc(input.faceUsdc),
    advance: Math.trunc(input.advance),
    attempts: existing?.attempts ?? 0,
    nextAttemptAt: now,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    lastError: input.lastError,
  };
  store.pending = [
    row,
    ...store.pending.filter((p) => p.invoiceId !== input.invoiceId),
  ];
  await writeStore(store);
  return row;
}

export async function listDuePendingRegistrations(
  limit = 50,
): Promise<PendingSettlementRegistration[]> {
  const store = await readStore();
  const now = Date.now();
  return store.pending
    .filter((p) => Date.parse(p.nextAttemptAt) <= now)
    .slice(0, limit);
}

export async function listPendingRegistrations(): Promise<PendingSettlementRegistration[]> {
  const store = await readStore();
  return [...store.pending];
}

export async function markRegistrationAttempt(
  invoiceId: string,
  result: { ok: true } | { ok: false; error: string },
): Promise<void> {
  const store = await readStore();
  if (result.ok) {
    store.pending = store.pending.filter((p) => p.invoiceId !== invoiceId);
    await writeStore(store);
    return;
  }
  const idx = store.pending.findIndex((p) => p.invoiceId === invoiceId);
  if (idx < 0) return;
  const attempts = store.pending[idx].attempts + 1;
  const delayMs = Math.min(60 * 60 * 1000, 30_000 * 2 ** Math.min(attempts, 6));
  store.pending[idx] = {
    ...store.pending[idx],
    attempts,
    lastError: result.error,
    updatedAt: new Date().toISOString(),
    nextAttemptAt: new Date(Date.now() + delayMs).toISOString(),
  };
  await writeStore(store);
}

export async function runPendingRegistrationWorker(): Promise<{
  attempted: number;
  succeeded: number;
  errors: string[];
}> {
  const { resolveSorobanConfig } = await import("@/lib/soroban/server-config");
  const { isSettlementChainEnabled, registerInvoiceOnChain } = await import(
    "@/lib/soroban/invoke-settlement"
  );

  const cfg = await resolveSorobanConfig();
  const result = { attempted: 0, succeeded: 0, errors: [] as string[] };
  if (!isSettlementChainEnabled(cfg)) return result;

  const due = await listDuePendingRegistrations();
  result.attempted = due.length;

  for (const row of due) {
    try {
      await registerInvoiceOnChain(cfg, row.invoiceId, row.faceUsdc, row.advance);
      await markRegistrationAttempt(row.invoiceId, { ok: true });
      result.succeeded++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await markRegistrationAttempt(row.invoiceId, { ok: false, error: message });
      result.errors.push(`${row.invoiceId}: ${message}`);
    }
  }

  return result;
}
