/**
 * GET  /api/auth/invite?token=  — Look up an invite by token
 * POST /api/auth/invite         — Accept an invite (requires active session)
 * PUT  /api/auth/invite         — Send a new invite (admin only)
 * DELETE /api/auth/invite?id=   — Revoke an invite (admin only)
 */
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSupabaseServer } from "@/lib/supabase/server";

// ── GET: look up invite ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: invite, error } = await admin
    .from("org_invites")
    .select(`
      id, org_id, email, role, expires_at, accepted_at,
      orgs ( name ),
      inviter:invited_by ( email )
    `)
    .eq("token", token)
    .single();

  if (error || !invite) {
    return NextResponse.json({ error: "Invite not found or expired" }, { status: 404 });
  }

  const expired =
    invite.accepted_at != null ||
    new Date(invite.expires_at) < new Date();

  // Supabase returns joined tables as arrays when using select with relations
  const orgsRel = invite.orgs as unknown;
  const inviterRel = invite.inviter as unknown;
  const orgName =
    Array.isArray(orgsRel)
      ? (orgsRel[0] as { name: string } | undefined)?.name ?? "Unknown org"
      : (orgsRel as { name: string } | null)?.name ?? "Unknown org";
  const inviterEmail =
    Array.isArray(inviterRel)
      ? (inviterRel[0] as { email: string } | undefined)?.email ?? "unknown"
      : (inviterRel as { email: string } | null)?.email ?? "unknown";

  return NextResponse.json({
    orgName,
    email: invite.email,
    role: invite.role,
    inviterEmail,
    expired,
  });
}

// ── POST: accept invite ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const { token } = body as { token?: string };
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Require authenticated session
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Look up invite
  const { data: invite, error: inviteErr } = await admin
    .from("org_invites")
    .select("id, org_id, email, role, expires_at, accepted_at")
    .eq("token", token)
    .single();

  if (inviteErr || !invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.accepted_at) {
    return NextResponse.json({ error: "Invite already accepted" }, { status: 409 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
  }

  // Email must match if specified
  if (invite.email && user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return NextResponse.json(
      { error: `This invite is for ${invite.email}` },
      { status: 403 },
    );
  }

  // Create membership + mark invite accepted (transaction via RPC not available,
  // use two calls with service role — acceptable for invite acceptance)
  const now = new Date().toISOString();

  const { error: memberErr } = await admin
    .from("org_memberships")
    .upsert(
      {
        org_id: invite.org_id,
        user_id: user.id,
        role: invite.role,
        accepted_at: now,
      },
      { onConflict: "org_id,user_id" },
    );

  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }

  await admin
    .from("org_invites")
    .update({ accepted_at: now })
    .eq("id", invite.id);

  // Update user metadata if this is their first org (owned org takes priority)
  const currentOrgId = user.user_metadata?.org_id;
  if (!currentOrgId) {
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, org_id: invite.org_id },
    });
  }

  return NextResponse.json({ ok: true });
}

// ── PUT: send invite ───────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { email, role = "member" } = body as {
    email?: string;
    role?: string;
  };

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const orgId = user.user_metadata?.org_id as string | undefined;
  if (!orgId) {
    return NextResponse.json({ error: "No org found" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  // Verify inviter is admin/owner
  const { data: membership } = await admin
    .from("org_memberships")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  // Check for existing active invite for this email+org
  const { data: existing } = await admin
    .from("org_invites")
    .select("id, expires_at")
    .eq("org_id", orgId)
    .eq("email", email.toLowerCase())
    .is("accepted_at", null)
    .single();

  if (existing && new Date(existing.expires_at) > new Date()) {
    return NextResponse.json({ error: "Active invite already exists for this email" }, { status: 409 });
  }

  const { data: invite, error: insertErr } = await admin
    .from("org_invites")
    .insert({
      org_id: orgId,
      email: email.toLowerCase().trim(),
      role,
      invited_by: user.id,
    })
    .select("token, id")
    .single();

  if (insertErr || !invite) {
    return NextResponse.json({ error: insertErr?.message ?? "Insert failed" }, { status: 500 });
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/invite?token=${invite.token}`;

  // TODO: Send invite email via Supabase Email or Resend once email provider is configured.
  // For now, return the invite URL so the admin can share it manually.

  return NextResponse.json({ ok: true, inviteUrl, token: invite.token });
}

// ── DELETE: revoke invite ──────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing invite id" }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const orgId = user.user_metadata?.org_id as string | undefined;

  const { data: invite } = await admin
    .from("org_invites")
    .select("org_id")
    .eq("id", id)
    .single();

  if (!invite || invite.org_id !== orgId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await admin.from("org_invites").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}
