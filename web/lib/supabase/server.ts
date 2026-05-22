/**
 * Supabase server client — for server components, server actions, and route handlers
 * that need the authenticated user's session (not admin/service-role access).
 *
 * Uses Next.js `cookies()` to thread the session through the request lifecycle.
 * Respects Row Level Security.
 *
 * For admin/service-role operations use lib/supabase/client.ts instead.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServer() {
  const cookieStore = await cookies();

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    "";

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll throws in Server Components (read-only context).
          // Safe to ignore — the middleware handles cookie refresh.
        }
      },
    },
  });
}

// ── Session helpers ────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  email: string | null;
  orgId: string | null;
  orgName: string | null;
  role: string | null;
};

/**
 * Returns the authenticated user with their primary org, or null if
 * unauthenticated. Uses the service-role admin client to fetch org data
 * (bypasses RLS — called server-side only).
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  if (!isServerAuthConfigured()) return null;

  const supabase = await getSupabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Org ID is stored in user metadata by the DB trigger (handle_new_user)
  const orgId = (user.user_metadata?.org_id as string) ?? null;
  let orgName: string | null = null;
  let role: string | null = null;

  if (orgId) {
    // Use admin client to avoid RLS chicken-and-egg (no session cookie yet)
    const { getSupabaseAdmin } = await import("./client");
    try {
      const admin = getSupabaseAdmin();
      const { data: org } = await admin
        .from("orgs")
        .select("name")
        .eq("id", orgId)
        .single();
      orgName = org?.name ?? null;

      const { data: membership } = await admin
        .from("org_memberships")
        .select("role")
        .eq("org_id", orgId)
        .eq("user_id", user.id)
        .single();
      role = membership?.role ?? null;
    } catch {
      // Non-fatal — org data is a nice-to-have in the layout
    }
  }

  return {
    id: user.id,
    email: user.email ?? null,
    orgId,
    orgName,
    role,
  };
}

export function isServerAuthConfigured(): boolean {
  return Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY),
  );
}
