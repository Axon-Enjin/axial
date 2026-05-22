import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { deriveDemoLockbox } from "@/lib/msme/invoice-trust";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  supabaseCreateConfirmation,
  supabaseCreateNoa,
  supabaseCreatePayer,
  supabaseGetConfirmationByReceivable,
  supabaseGetConfirmationByToken,
  supabaseGetNoaByReceivable,
  supabaseGetPayer,
  supabaseListPayersByOrg,
  supabaseUpdateConfirmation,
  supabaseUpdateNoa,
  supabaseUpdatePayer,
} from "@/lib/supabase/payers-store";
import type {
  ConfirmationStatus,
  InvoiceConfirmation,
  KybStatus,
  NoticeOfAssignment,
  Payer,
} from "./types";
import { generateNoaDocumentRef, generatePayerAuthToken, newId } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "closed-loop.json");

type StoreFile = {
  payers: Payer[];
  confirmations: InvoiceConfirmation[];
  noas: NoticeOfAssignment[];
};

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreFile;
  } catch {
    return { payers: [], confirmations: [], noas: [] };
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
      err.message.includes("payers") ||
      err.message.includes("invoice_confirmations") ||
      err.message.includes("notices_of_assignment"))
  );
}

async function withFileFallback<T>(
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

// ── Payers ────────────────────────────────────────────────────────────────────

export async function createPayer(data: {
  orgId: string;
  legalName: string;
  tin: string;
  contactEmail: string;
}): Promise<Payer> {
  const now = new Date().toISOString();
  const payer: Payer = {
    id: newId(),
    orgId: data.orgId,
    legalName: data.legalName,
    tin: data.tin,
    contactEmail: data.contactEmail,
    kybStatus: "pending",
    kybVerifiedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  return withFileFallback(
    () => supabaseCreatePayer(payer),
    async () => {
      const store = await readStore();
      store.payers.unshift(payer);
      await writeStore(store);
      return payer;
    },
  );
}

export async function getPayer(id: string): Promise<Payer | null> {
  return withFileFallback(
    () => supabaseGetPayer(id),
    async () => {
      const store = await readStore();
      return store.payers.find((p) => p.id === id) ?? null;
    },
  );
}

export async function listPayersByOrg(orgId: string): Promise<Payer[]> {
  return withFileFallback(
    () => supabaseListPayersByOrg(orgId),
    async () => {
      const store = await readStore();
      return store.payers.filter((p) => p.orgId === orgId);
    },
  );
}

export async function updatePayerKyb(
  id: string,
  status: KybStatus,
): Promise<Payer> {
  const now = new Date().toISOString();
  const patch = {
    kybStatus: status,
    kybVerifiedAt: status === "verified" ? now : null,
    updatedAt: now,
  };

  return withFileFallback(
    () => supabaseUpdatePayer(id, patch),
    async () => {
      const store = await readStore();
      const idx = store.payers.findIndex((p) => p.id === id);
      if (idx < 0) throw new Error(`Payer not found: ${id}`);
      store.payers[idx] = { ...store.payers[idx]!, ...patch };
      await writeStore(store);
      return store.payers[idx]!;
    },
  );
}

/** Mock KYB: auto-advance to verified. In production, call a KYB provider. */
export async function triggerMockKyb(payerId: string): Promise<void> {
  await updatePayerKyb(payerId, "verified");
}

// ── Invoice Confirmations ─────────────────────────────────────────────────────

export async function requestConfirmation(data: {
  receivableId: string;
  payerId: string;
  confirmedAmount: number;
  dueDate: string;
}): Promise<InvoiceConfirmation> {
  const existing = await getConfirmationByReceivable(data.receivableId);
  if (existing && existing.status === "confirmed") return existing;

  const now = new Date().toISOString();
  const confirmation: InvoiceConfirmation = {
    id: newId(),
    receivableId: data.receivableId,
    payerId: data.payerId,
    confirmedAmount: data.confirmedAmount,
    dueDate: data.dueDate,
    status: "pending",
    authToken: generatePayerAuthToken(),
    confirmedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  return withFileFallback(
    () => supabaseCreateConfirmation(confirmation),
    async () => {
      const store = await readStore();
      const existingIdx = store.confirmations.findIndex(
        (c) => c.receivableId === data.receivableId,
      );
      if (existingIdx >= 0) {
        store.confirmations[existingIdx] = confirmation;
      } else {
        store.confirmations.unshift(confirmation);
      }
      await writeStore(store);
      return confirmation;
    },
  );
}

export async function getConfirmationByReceivable(
  receivableId: string,
): Promise<InvoiceConfirmation | null> {
  return withFileFallback(
    () => supabaseGetConfirmationByReceivable(receivableId),
    async () => {
      const store = await readStore();
      return store.confirmations.find((c) => c.receivableId === receivableId) ?? null;
    },
  );
}

export async function getConfirmationByToken(
  token: string,
): Promise<InvoiceConfirmation | null> {
  return withFileFallback(
    () => supabaseGetConfirmationByToken(token),
    async () => {
      const store = await readStore();
      return store.confirmations.find((c) => c.authToken === token) ?? null;
    },
  );
}

export async function confirmInvoiceByToken(
  token: string,
): Promise<InvoiceConfirmation> {
  const confirmation = await getConfirmationByToken(token);
  if (!confirmation) throw new Error("Invalid or expired confirmation token");
  if (confirmation.status === "confirmed") return confirmation;

  const now = new Date().toISOString();
  const patch: Partial<InvoiceConfirmation> = {
    status: "confirmed" as ConfirmationStatus,
    confirmedAt: now,
    updatedAt: now,
  };

  return withFileFallback(
    () => supabaseUpdateConfirmation(confirmation.id, patch),
    async () => {
      const store = await readStore();
      const idx = store.confirmations.findIndex((c) => c.id === confirmation.id);
      if (idx < 0) throw new Error("Confirmation record not found");
      store.confirmations[idx] = { ...store.confirmations[idx]!, ...patch };
      await writeStore(store);
      return store.confirmations[idx]!;
    },
  );
}

// ── Notices of Assignment ─────────────────────────────────────────────────────

export async function issueNoa(data: {
  receivableId: string;
  payerId: string;
}): Promise<NoticeOfAssignment> {
  const existing = await getNoaByReceivable(data.receivableId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const { address } = deriveDemoLockbox(data.receivableId);
  const noa: NoticeOfAssignment = {
    id: newId(),
    receivableId: data.receivableId,
    payerId: data.payerId,
    noaDocumentRef: generateNoaDocumentRef(data.receivableId, data.payerId),
    lockboxAddress: address,
    ackStatus: "issued",
    ackMethod: null,
    acknowledgedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  return withFileFallback(
    () => supabaseCreateNoa(noa),
    async () => {
      const store = await readStore();
      store.noas.unshift(noa);
      await writeStore(store);
      return noa;
    },
  );
}

export async function getNoaByReceivable(
  receivableId: string,
): Promise<NoticeOfAssignment | null> {
  return withFileFallback(
    () => supabaseGetNoaByReceivable(receivableId),
    async () => {
      const store = await readStore();
      return store.noas.find((n) => n.receivableId === receivableId) ?? null;
    },
  );
}

export async function acknowledgeNoa(
  receivableId: string,
  method: "in_app" | "signed_pdf" = "in_app",
): Promise<NoticeOfAssignment> {
  const noa = await getNoaByReceivable(receivableId);
  if (!noa) throw new Error(`NoA not found for receivable: ${receivableId}`);
  if (noa.ackStatus === "acknowledged") return noa;

  const now = new Date().toISOString();
  const patch: Partial<NoticeOfAssignment> = {
    ackStatus: "acknowledged",
    ackMethod: method,
    acknowledgedAt: now,
    updatedAt: now,
  };

  return withFileFallback(
    () => supabaseUpdateNoa(noa.id, patch),
    async () => {
      const store = await readStore();
      const idx = store.noas.findIndex((n) => n.id === noa.id);
      if (idx < 0) throw new Error("NoA record not found");
      store.noas[idx] = { ...store.noas[idx]!, ...patch };
      await writeStore(store);
      return store.noas[idx]!;
    },
  );
}
