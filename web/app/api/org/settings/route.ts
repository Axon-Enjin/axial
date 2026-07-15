import { NextResponse } from "next/server";
import { getOrgProfile, updateOrgTaxProfile } from "@/lib/org/store";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const orgId = (user?.user_metadata?.org_id as string | undefined) ?? undefined;
  const profile = await getOrgProfile(orgId);

  return NextResponse.json({
    sellerTin: profile?.sellerTin ?? "",
    sellerName: profile?.sellerName ?? "",
    sellerAddress: profile?.sellerAddress ?? "",
    buyerTinDefault: profile?.buyerTinDefault ?? "",
    buyerNameDefault: profile?.buyerNameDefault ?? "",
    buyerAddressDefault: profile?.buyerAddressDefault ?? "",
    frozenAt: profile?.frozenAt ?? null,
    freezeReason: profile?.freezeReason ?? null,
  });
}

type PatchBody = {
  sellerTin?: string;
  sellerName?: string;
  sellerAddress?: string;
  buyerTinDefault?: string;
  buyerNameDefault?: string;
  buyerAddressDefault?: string;
};

export async function PATCH(request: Request) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const orgId = (user?.user_metadata?.org_id as string | undefined) ?? undefined;

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const profile = await updateOrgTaxProfile(orgId, {
    sellerTin: body.sellerTin?.trim(),
    sellerName: body.sellerName?.trim(),
    sellerAddress: body.sellerAddress?.trim(),
    buyerTinDefault: body.buyerTinDefault?.trim(),
    buyerNameDefault: body.buyerNameDefault?.trim(),
    buyerAddressDefault: body.buyerAddressDefault?.trim(),
  });

  return NextResponse.json({
    sellerTin: profile.sellerTin ?? "",
    sellerName: profile.sellerName ?? "",
    sellerAddress: profile.sellerAddress ?? "",
    buyerTinDefault: profile.buyerTinDefault ?? "",
    buyerNameDefault: profile.buyerNameDefault ?? "",
    buyerAddressDefault: profile.buyerAddressDefault ?? "",
  });
}
