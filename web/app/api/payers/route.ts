import { NextResponse } from "next/server";
import { resolveOrgId } from "@/lib/org/store";
import { createPayer, listPayersByOrg } from "@/lib/payers/store";
import { createKybProvider } from "@/lib/payers/kyb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = resolveOrgId(searchParams.get("orgId"));

  try {
    const payers = await listPayersByOrg(orgId);
    return NextResponse.json({ payers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "List failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

type PostBody = {
  legalName?: string;
  tin?: string;
  contactEmail?: string;
  orgId?: string;
};

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const legalName = body.legalName?.trim();
  const tin = body.tin?.trim();
  const contactEmail = body.contactEmail?.trim();
  const orgId = resolveOrgId(body.orgId);

  if (!legalName) {
    return NextResponse.json({ error: "legalName is required" }, { status: 400 });
  }
  if (!tin) {
    return NextResponse.json({ error: "tin is required" }, { status: 400 });
  }
  if (!contactEmail) {
    return NextResponse.json({ error: "contactEmail is required" }, { status: 400 });
  }

  try {
    const payer = await createPayer({ orgId, legalName, tin, contactEmail });
    const kyb = createKybProvider();
    await kyb.verifyOnCreate(payer.id);
    const refreshed = await listPayersByOrg(orgId);
    const verified = refreshed.find((p) => p.id === payer.id) ?? payer;
    return NextResponse.json({ payer: verified, kybMode: kyb.mode }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
