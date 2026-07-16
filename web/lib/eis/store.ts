import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  supabaseFindById,
  supabaseFindByIdempotencyKey,
  supabaseFindByPayloadId,
  supabaseListSubmissions,
  supabaseUpsertSubmission,
} from "@/lib/supabase/eis-store";
import type { EisSubmission } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "eis-submissions.json");

export type EisStoreBackend = "supabase" | "file";

export function getEisStoreBackend(): EisStoreBackend {
  return isSupabaseConfigured() ? "supabase" : "file";
}

type StoreFile = {
  submissions: EisSubmission[];
};

async function readFileStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreFile;
  } catch {
    return { submissions: [] };
  }
}

async function writeFileStore(data: StoreFile) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function findByIdempotencyKey(
  key: string,
): Promise<EisSubmission | null> {
  if (isSupabaseConfigured()) {
    return supabaseFindByIdempotencyKey(key);
  }
  const store = await readFileStore();
  return store.submissions.find((s) => s.idempotencyKey === key) ?? null;
}

export async function findSubmissionById(
  id: string,
): Promise<EisSubmission | null> {
  if (isSupabaseConfigured()) {
    return supabaseFindById(id);
  }
  const store = await readFileStore();
  return store.submissions.find((s) => s.id === id) ?? null;
}

export async function findSubmissionByPayloadId(
  payloadId: string,
): Promise<EisSubmission | null> {
  if (isSupabaseConfigured()) {
    return supabaseFindByPayloadId(payloadId);
  }
  const store = await readFileStore();
  return store.submissions.find((s) => s.payloadId === payloadId) ?? null;
}

/** Resolve by store uuid first, then payloadId. */
export async function findSubmissionByIdOrPayloadId(
  idOrPayloadId: string,
): Promise<EisSubmission | null> {
  const byId = await findSubmissionById(idOrPayloadId);
  if (byId) return byId;
  return findSubmissionByPayloadId(idOrPayloadId);
}

export async function listSubmissions(limit = 50): Promise<EisSubmission[]> {
  if (isSupabaseConfigured()) {
    return supabaseListSubmissions(limit);
  }
  const store = await readFileStore();
  return [...store.submissions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function upsertSubmission(sub: EisSubmission): Promise<EisSubmission> {
  if (isSupabaseConfigured()) {
    return supabaseUpsertSubmission(sub);
  }
  const store = await readFileStore();
  const idx = store.submissions.findIndex((s) => s.id === sub.id);
  if (idx >= 0) {
    store.submissions[idx] = sub;
  } else {
    store.submissions.unshift(sub);
  }
  await writeFileStore(store);
  return sub;
}

/**
 * Failed submissions still inside their T+3 window (worker retry).
 * Does not include `prepared` — that awaits human approve.
 */
export async function findSubmissionsForRetry(limit = 100): Promise<EisSubmission[]> {
  const all = await listSubmissions(500);
  const now = new Date().toISOString();
  return all
    .filter(
      (s) =>
        s.status === "failed" &&
        (s.dueBy == null || s.dueBy > now),
    )
    .slice(0, limit);
}

/**
 * prepared | failed | legacy queued past T+3 deadline.
 */
export async function findExpiredSubmissions(): Promise<EisSubmission[]> {
  const all = await listSubmissions(500);
  const now = new Date().toISOString();
  return all.filter(
    (s) =>
      (s.status === "prepared" ||
        s.status === "failed" ||
        s.status === "queued") &&
      s.dueBy != null &&
      s.dueBy <= now,
  );
}

export function buildIdempotencyKey(
  orgId: string,
  stellarTxHash: string,
  referenceId: string,
): string {
  return `${orgId}:${stellarTxHash}:${referenceId}`;
}

export function newPayloadId(): string {
  const t = Date.now().toString(36).toUpperCase();
  return `PLD-${t}`;
}
