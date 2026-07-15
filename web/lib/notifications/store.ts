import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import { resolveOrgId } from "@/lib/org/store";
import type { AppNotification, NotificationKind } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "notifications.json");

type FileStore = { items: AppNotification[] };

async function readFileStore(): Promise<FileStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as FileStore;
  } catch {
    return { items: [] };
  }
}

async function writeFileStore(data: FileStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

function newId(): string {
  return randomBytes(12).toString("hex");
}

export async function createNotification(input: {
  orgId?: string | null;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string | null;
}): Promise<AppNotification> {
  const orgId = input.orgId ? resolveOrgId(input.orgId) : null;
  const row: AppNotification = {
    id: newId(),
    orgId,
    kind: input.kind,
    title: input.title,
    body: input.body,
    href: input.href ?? null,
    readAt: null,
    createdAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    store.items.unshift(row);
    store.items = store.items.slice(0, 200);
    await writeFileStore(store);
    return row;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        org_id: orgId,
        kind: row.kind,
        title: row.title,
        body: row.body,
        href: row.href,
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: String(data.id),
      orgId: (data.org_id as string | null) ?? null,
      kind: data.kind as NotificationKind,
      title: data.title,
      body: data.body,
      href: (data.href as string | null) ?? null,
      readAt: (data.read_at as string | null) ?? null,
      createdAt: data.created_at as string,
    };
  } catch {
    const store = await readFileStore();
    store.items.unshift(row);
    await writeFileStore(store);
    return row;
  }
}

export async function listNotifications(
  orgId?: string | null,
  limit = 30,
): Promise<AppNotification[]> {
  const id = resolveOrgId(orgId);

  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    return store.items
      .filter((n) => !n.orgId || n.orgId === id)
      .slice(0, limit);
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`org_id.eq.${id},org_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((d) => ({
      id: String(d.id),
      orgId: (d.org_id as string | null) ?? null,
      kind: d.kind as NotificationKind,
      title: d.title,
      body: d.body,
      href: (d.href as string | null) ?? null,
      readAt: (d.read_at as string | null) ?? null,
      createdAt: d.created_at as string,
    }));
  } catch {
    const store = await readFileStore();
    return store.items.filter((n) => !n.orgId || n.orgId === id).slice(0, limit);
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    const idx = store.items.findIndex((n) => n.id === id);
    if (idx >= 0) store.items[idx]!.readAt = now;
    await writeFileStore(store);
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("notifications").update({ read_at: now }).eq("id", id);
  } catch {
    const store = await readFileStore();
    const idx = store.items.findIndex((n) => n.id === id);
    if (idx >= 0) store.items[idx]!.readAt = now;
    await writeFileStore(store);
  }
}

export async function markAllNotificationsRead(orgId?: string | null): Promise<void> {
  const id = resolveOrgId(orgId);
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    for (const n of store.items) {
      if (!n.orgId || n.orgId === id) n.readAt = now;
    }
    await writeFileStore(store);
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .or(`org_id.eq.${id},org_id.is.null`)
      .is("read_at", null);
  } catch {
    // non-fatal
  }
}

export function countUnread(items: AppNotification[]): number {
  return items.filter((n) => !n.readAt).length;
}
