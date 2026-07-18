import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import type { TelegramLink, TelegramLinkCode } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "telegram-links.json");

type FileStore = {
  links: TelegramLink[];
  codes: TelegramLinkCode[];
};

async function readFileStore(): Promise<FileStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as FileStore;
  } catch {
    return { links: [], codes: [] };
  }
}

async function writeFileStore(data: FileStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

function newId(): string {
  return randomBytes(12).toString("hex");
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
}

export async function createLinkCode(input: {
  orgId: string;
  userId: string | null;
  role: string;
  ttlMinutes?: number;
}): Promise<TelegramLinkCode> {
  const ttl = input.ttlMinutes ?? 15;
  const code = randomBytes(4).toString("hex").toUpperCase();
  const now = new Date();
  const row: TelegramLinkCode = {
    code,
    orgId: input.orgId,
    userId: input.userId,
    role: input.role,
    expiresAt: new Date(now.getTime() + ttl * 60_000).toISOString(),
    createdAt: now.toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    store.codes = store.codes.filter((c) => c.expiresAt > now.toISOString());
    store.codes.push(row);
    await writeFileStore(store);
    return row;
  }

  const { error } = await getSupabaseAdmin().from("telegram_link_codes").upsert({
    code: row.code,
    org_id: row.orgId,
    user_id: row.userId,
    role: row.role,
    expires_at: row.expiresAt,
    created_at: row.createdAt,
  });
  if (error) throw new Error(error.message);
  return row;
}

export async function consumeLinkCode(code: string): Promise<TelegramLinkCode | null> {
  const normalized = code.trim().toUpperCase();
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    const idx = store.codes.findIndex((c) => c.code === normalized && c.expiresAt > now);
    if (idx < 0) return null;
    const [row] = store.codes.splice(idx, 1);
    await writeFileStore(store);
    return row;
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("telegram_link_codes")
    .select("*")
    .eq("code", normalized)
    .gt("expires_at", now)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  await admin.from("telegram_link_codes").delete().eq("code", normalized);
  return {
    code: data.code as string,
    orgId: data.org_id as string,
    userId: (data.user_id as string | null) ?? null,
    role: (data.role as string) ?? "member",
    expiresAt: data.expires_at as string,
    createdAt: data.created_at as string,
  };
}

export async function upsertTelegramLink(input: {
  orgId: string;
  userId: string | null;
  chatId: number;
  telegramUserId: number | null;
  role: string;
}): Promise<TelegramLink> {
  const row: TelegramLink = {
    id: newId(),
    orgId: input.orgId,
    userId: input.userId,
    chatId: input.chatId,
    telegramUserId: input.telegramUserId,
    role: input.role,
    linkedAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    store.links = store.links.filter((l) => l.chatId !== input.chatId);
    store.links.push(row);
    await writeFileStore(store);
    return row;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("telegram_links")
    .upsert(
      {
        org_id: row.orgId,
        user_id: row.userId,
        chat_id: row.chatId,
        telegram_user_id: row.telegramUserId,
        role: row.role,
        linked_at: row.linkedAt,
      },
      { onConflict: "chat_id" },
    )
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return {
    id: String(data.id),
    orgId: data.org_id as string,
    userId: (data.user_id as string | null) ?? null,
    chatId: Number(data.chat_id),
    telegramUserId: data.telegram_user_id != null ? Number(data.telegram_user_id) : null,
    role: (data.role as string) ?? "member",
    linkedAt: data.linked_at as string,
  };
}

export async function findLinkByChatId(chatId: number): Promise<TelegramLink | null> {
  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    return store.links.find((l) => l.chatId === chatId) ?? null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("telegram_links")
    .select("*")
    .eq("chat_id", chatId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    id: String(data.id),
    orgId: data.org_id as string,
    userId: (data.user_id as string | null) ?? null,
    chatId: Number(data.chat_id),
    telegramUserId: data.telegram_user_id != null ? Number(data.telegram_user_id) : null,
    role: (data.role as string) ?? "member",
    linkedAt: data.linked_at as string,
  };
}

export async function listLinksByOrg(orgId: string): Promise<TelegramLink[]> {
  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    return store.links.filter((l) => l.orgId === orgId);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("telegram_links")
    .select("*")
    .eq("org_id", orgId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    orgId: row.org_id as string,
    userId: (row.user_id as string | null) ?? null,
    chatId: Number(row.chat_id),
    telegramUserId: row.telegram_user_id != null ? Number(row.telegram_user_id) : null,
    role: (row.role as string) ?? "member",
    linkedAt: row.linked_at as string,
  }));
}

export async function deleteLinkByChatId(chatId: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    store.links = store.links.filter((l) => l.chatId !== chatId);
    await writeFileStore(store);
    return;
  }
  const { error } = await getSupabaseAdmin()
    .from("telegram_links")
    .delete()
    .eq("chat_id", chatId);
  if (error) throw new Error(error.message);
}

export async function deleteLinksForOrg(orgId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    store.links = store.links.filter((l) => l.orgId !== orgId);
    await writeFileStore(store);
    return;
  }
  const { error } = await getSupabaseAdmin()
    .from("telegram_links")
    .delete()
    .eq("org_id", orgId);
  if (error) throw new Error(error.message);
}
