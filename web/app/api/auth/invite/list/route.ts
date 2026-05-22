/**
 * GET /api/auth/invite/list
 *
 * Returns pending (not yet accepted) invites for the authenticated user's org.
 * Admin/owner only.
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

  // Verify admin/owner
  const { data: membership } = await admin
    .from("org_memberships")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json([]);
  }

  const { data: invites } = await admin
    .from("org_invites")
    .select("id, email, role, expires_at, accepted_at, token")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return NextResponse.json(invites ?? []);
}
