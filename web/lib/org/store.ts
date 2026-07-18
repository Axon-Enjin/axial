import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import type { OrgProfile, OrgTaxProfile } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "org-profile.json");

type FileStore = {
  orgs: Record<
    string,
    Partial<OrgProfile> & { id: string; name?: string; slug?: string }
  >;
};

async function readFileStore(): Promise<FileStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as FileStore;
  } catch {
    return { orgs: {} };
  }
}

async function writeFileStore(data: FileStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

function mapRow(row: Record<string, unknown>): OrgProfile {
  return {
    id: String(row.id),
    name: String(row.name ?? "Organization"),
    slug: String(row.slug ?? "org"),
    trustBoundaryAckedAt: (row.trust_boundary_acked_at as string | null) ?? null,
    sellerTin: (row.seller_tin as string | null) ?? null,
    sellerName: (row.seller_name as string | null) ?? null,
    sellerAddress: (row.seller_address as string | null) ?? null,
    buyerTinDefault: (row.buyer_tin_default as string | null) ?? null,
    buyerNameDefault: (row.buyer_name_default as string | null) ?? null,
    buyerAddressDefault: (row.buyer_address_default as string | null) ?? null,
    frozenAt: (row.frozen_at as string | null) ?? null,
    freezeReason: (row.freeze_reason as string | null) ?? null,
  };
}

export function resolveOrgId(orgId?: string | null): string {
  return orgId?.trim() || process.env.AXIAL_ORG_ID?.trim() || "demo-org";
}

function slugifyOrg(name: string): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  if (!slug) slug = "org";
  return slug;
}

/**
 * Ensure auth user has an org + owner membership + user_metadata.org_id.
 * Backfills accounts created before handle_new_user trigger was installed.
 */
export async function ensureUserOrg(input: {
  userId: string;
  email?: string | null;
  existingOrgId?: string | null;
}): Promise<{ orgId: string; role: string }> {
  if (input.existingOrgId?.trim()) {
    return { orgId: input.existingOrgId.trim(), role: "owner" };
  }

  if (!isSupabaseConfigured()) {
    return { orgId: resolveOrgId(null), role: "owner" };
  }

  const admin = getSupabaseAdmin();

  const { data: membership } = await admin
    .from("org_memberships")
    .select("org_id, role")
    .eq("user_id", input.userId)
    .limit(1)
    .maybeSingle();

  if (membership?.org_id) {
    const orgId = String(membership.org_id);
    await admin.auth.admin.updateUserById(input.userId, {
      user_metadata: { org_id: orgId },
    });
    return { orgId, role: String(membership.role ?? "owner") };
  }

  const orgName =
    input.email?.split("@")[0]?.trim() || `org-${input.userId.slice(0, 8)}`;
  const slug = slugifyOrg(orgName);
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const { data: created, error } = await admin
      .from("orgs")
      .insert({ name: orgName, slug: candidate })
      .select("id")
      .single();
    if (!error && created?.id) {
      const orgId = String(created.id);
      await admin.from("org_memberships").insert({
        org_id: orgId,
        user_id: input.userId,
        role: "owner",
        accepted_at: new Date().toISOString(),
      });
      await admin.auth.admin.updateUserById(input.userId, {
        user_metadata: { org_id: orgId },
      });
      return { orgId, role: "owner" };
    }
  }

  throw new Error("Could not provision organization");
}

export async function getOrgProfile(orgId?: string | null): Promise<OrgProfile | null> {
  const id = resolveOrgId(orgId);

  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    const row = store.orgs[id];
    if (!row) {
      return {
        id,
        name: "Demo Organization",
        slug: "demo",
        trustBoundaryAckedAt: null,
        sellerTin: null,
        sellerName: null,
        sellerAddress: null,
        buyerTinDefault: null,
        buyerNameDefault: null,
        buyerAddressDefault: null,
        frozenAt: null,
        freezeReason: null,
      };
    }
    return {
      id,
      name: row.name ?? "Organization",
      slug: row.slug ?? "org",
      trustBoundaryAckedAt: row.trustBoundaryAckedAt ?? null,
      sellerTin: row.sellerTin ?? null,
      sellerName: row.sellerName ?? null,
      sellerAddress: row.sellerAddress ?? null,
      buyerTinDefault: row.buyerTinDefault ?? null,
      buyerNameDefault: row.buyerNameDefault ?? null,
      buyerAddressDefault: row.buyerAddressDefault ?? null,
      frozenAt: row.frozenAt ?? null,
      freezeReason: row.freezeReason ?? null,
    };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("orgs").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapRow(data as Record<string, unknown>);
  } catch {
    const store = await readFileStore();
    const row = store.orgs[id];
    if (!row) {
      return {
        id,
        name: "Demo Organization",
        slug: "demo",
        trustBoundaryAckedAt: null,
        sellerTin: null,
        sellerName: null,
        sellerAddress: null,
        buyerTinDefault: null,
        buyerNameDefault: null,
        buyerAddressDefault: null,
        frozenAt: null,
        freezeReason: null,
      };
    }
    return {
      id,
      name: row.name ?? "Organization",
      slug: row.slug ?? "org",
      trustBoundaryAckedAt: row.trustBoundaryAckedAt ?? null,
      sellerTin: row.sellerTin ?? null,
      sellerName: row.sellerName ?? null,
      sellerAddress: row.sellerAddress ?? null,
      buyerTinDefault: row.buyerTinDefault ?? null,
      buyerNameDefault: row.buyerNameDefault ?? null,
      buyerAddressDefault: row.buyerAddressDefault ?? null,
      frozenAt: row.frozenAt ?? null,
      freezeReason: row.freezeReason ?? null,
    };
  }
}

export async function ackTrustBoundary(orgId?: string | null): Promise<OrgProfile> {
  const id = resolveOrgId(orgId);
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    const existing = store.orgs[id] ?? { id };
    store.orgs[id] = { ...existing, trustBoundaryAckedAt: now };
    await writeFileStore(store);
    return (await getOrgProfile(id))!;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orgs")
    .update({ trust_boundary_acked_at: now })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    const store = await readFileStore();
    const existing = store.orgs[id] ?? { id };
    store.orgs[id] = { ...existing, trustBoundaryAckedAt: now };
    await writeFileStore(store);
    return (await getOrgProfile(id))!;
  }

  return mapRow(data as Record<string, unknown>);
}

export async function updateOrgTaxProfile(
  orgId: string | null | undefined,
  profile: Partial<OrgTaxProfile>,
): Promise<OrgProfile> {
  const id = resolveOrgId(orgId);
  const patch: Record<string, string> = {};
  if (profile.sellerTin) patch.seller_tin = profile.sellerTin;
  if (profile.sellerName) patch.seller_name = profile.sellerName;
  if (profile.sellerAddress) patch.seller_address = profile.sellerAddress;
  if (profile.buyerTinDefault) patch.buyer_tin_default = profile.buyerTinDefault;
  if (profile.buyerNameDefault) patch.buyer_name_default = profile.buyerNameDefault;
  if (profile.buyerAddressDefault) patch.buyer_address_default = profile.buyerAddressDefault;

  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    const existing = store.orgs[id] ?? { id };
    store.orgs[id] = {
      ...existing,
      sellerTin: profile.sellerTin ?? existing.sellerTin,
      sellerName: profile.sellerName ?? existing.sellerName,
      sellerAddress: profile.sellerAddress ?? existing.sellerAddress,
      buyerTinDefault: profile.buyerTinDefault ?? existing.buyerTinDefault,
      buyerNameDefault: profile.buyerNameDefault ?? existing.buyerNameDefault,
      buyerAddressDefault: profile.buyerAddressDefault ?? existing.buyerAddressDefault,
    };
    await writeFileStore(store);
    return (await getOrgProfile(id))!;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orgs")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    const store = await readFileStore();
    const existing = store.orgs[id] ?? { id };
    store.orgs[id] = { ...existing, ...profile };
    await writeFileStore(store);
    return (await getOrgProfile(id))!;
  }

  return mapRow(data as Record<string, unknown>);
}

export async function freezeOrg(
  orgId: string | null | undefined,
  reason: string,
): Promise<OrgProfile> {
  const id = resolveOrgId(orgId);
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const store = await readFileStore();
    const existing = store.orgs[id] ?? { id };
    store.orgs[id] = { ...existing, frozenAt: now, freezeReason: reason };
    await writeFileStore(store);
    return (await getOrgProfile(id))!;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orgs")
    .update({ frozen_at: now, freeze_reason: reason })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    const store = await readFileStore();
    const existing = store.orgs[id] ?? { id };
    store.orgs[id] = { ...existing, frozenAt: now, freezeReason: reason };
    await writeFileStore(store);
    return (await getOrgProfile(id))!;
  }

  return mapRow(data as Record<string, unknown>);
}

export function isOrgFrozen(profile: OrgProfile | null): boolean {
  return Boolean(profile?.frozenAt);
}

export async function isTrustBoundaryAcked(orgId?: string | null): Promise<boolean> {
  const profile = await getOrgProfile(orgId);
  return Boolean(profile?.trustBoundaryAckedAt);
}

export async function resolveEisPartyDefaults(orgId?: string | null): Promise<{
  seller: { tin: string; name: string; address: string };
  buyer: { tin: string; name: string; address: string };
}> {
  const profile = await getOrgProfile(orgId);
  return {
    seller: {
      tin: profile?.sellerTin ?? process.env.AXIAL_SELLER_TIN ?? "123-456-789-00000",
      name: profile?.sellerName ?? process.env.AXIAL_SELLER_NAME ?? "Axial Demo MSME Inc.",
      address:
        profile?.sellerAddress ??
        process.env.AXIAL_SELLER_ADDRESS ??
        "Makati City, Metro Manila, PH",
    },
    buyer: {
      tin: profile?.buyerTinDefault ?? process.env.AXIAL_BUYER_TIN ?? "987-654-321-00000",
      name: profile?.buyerNameDefault ?? process.env.AXIAL_BUYER_NAME ?? "Acme Logistics Corp",
      address:
        profile?.buyerAddressDefault ??
        process.env.AXIAL_BUYER_ADDRESS ??
        "BGC, Taguig City, Metro Manila, PH",
    },
  };
}
