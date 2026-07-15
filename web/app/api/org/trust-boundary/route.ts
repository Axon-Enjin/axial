import { NextResponse } from "next/server";
import { ackTrustBoundary, getOrgProfile, isTrustBoundaryAcked } from "@/lib/org/store";
import { TRUST_BOUNDARY_DRAFT } from "@/lib/org/types";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const orgId = (user?.user_metadata?.org_id as string | undefined) ?? undefined;

  const acked = await isTrustBoundaryAcked(orgId);
  const profile = await getOrgProfile(orgId);

  return NextResponse.json({
    acked,
    ackedAt: profile?.trustBoundaryAckedAt ?? null,
    draft: TRUST_BOUNDARY_DRAFT,
    frozen: Boolean(profile?.frozenAt),
    freezeReason: profile?.freezeReason ?? null,
  });
}

export async function POST() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const orgId = (user?.user_metadata?.org_id as string | undefined) ?? undefined;

  const profile = await ackTrustBoundary(orgId);
  return NextResponse.json({
    acked: true,
    ackedAt: profile.trustBoundaryAckedAt,
  });
}
