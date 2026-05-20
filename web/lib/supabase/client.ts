import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function getSupabaseServerKey(): string | null {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    null
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && getSupabaseServerKey());
}

/** Server-only admin client (API routes). Never import in client components. */
export function getSupabaseAdmin(): SupabaseClient {
  const key = getSupabaseServerKey();
  if (!process.env.SUPABASE_URL || !key) {
    throw new Error(
      "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY for demo)",
    );
  }

  if (!adminClient) {
    adminClient = createClient(process.env.SUPABASE_URL, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return adminClient;
}
