/**
 * GET /api/auth/members
 *
 * Returns the authenticated user's org members with their emails.
 * Requires an active session.
 */
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const orgId = user.user_metadata?.org_id as string | undefined;
  if (!orgId) {
    return NextResponse.json([]);
  }

  const admin = getSupabaseAdmin();

  // Fetch memberships
  const { data: memberships, error } = await admin
    .from("org_memberships")
    .select("id, user_id, role, accepted_at")
    .eq("org_id", orgId)
    .not("accepted_at", "is", null)
    .order("created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch emails for each user via admin.auth
  const members = await Promise.all(
    (memberships ?? []).map(async (m) => {
      let email: string | undefined;
      try {
        const { data } = await admin.auth.admin.getUserById(m.user_id);
        email = data.user?.email ?? undefined;
      } catch {
        // Non-fatal — show user_id as fallback
      }
      return { ...m, email };
    }),
  );

  return NextResponse.json(members);
}
