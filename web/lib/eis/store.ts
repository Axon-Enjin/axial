import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { EisSubmission } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "eis-submissions.json");

type StoreFile = {
  submissions: EisSubmission[];
};

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreFile;
  } catch {
    return { submissions: [] };
  }
}

async function writeStore(data: StoreFile) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function findByIdempotencyKey(
  key: string,
): Promise<EisSubmission | null> {
  const store = await readStore();
  return store.submissions.find((s) => s.idempotencyKey === key) ?? null;
}

export async function listSubmissions(limit = 50): Promise<EisSubmission[]> {
  const store = await readStore();
  return [...store.submissions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function upsertSubmission(sub: EisSubmission): Promise<EisSubmission> {
  const store = await readStore();
  const idx = store.submissions.findIndex((s) => s.id === sub.id);
  if (idx >= 0) {
    store.submissions[idx] = sub;
  } else {
    store.submissions.unshift(sub);
  }
  await writeStore(store);
  return sub;
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
