import { NextResponse } from "next/server";
import { createPayer, listPayersByOrg, triggerMockKyb } from "@/lib/payers/store";

const DEFAULT_ORG_ID = "demo-org";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId") ?? DEFAULT_ORG_ID;

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
  const orgId = (body.orgId ?? DEFAULT_ORG_ID).trim();

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
    // Mock KYB: auto-advance to verified for demo
    await triggerMockKyb(payer.id);
    const verified = { ...payer, kybStatus: "verified" as const };
    return NextResponse.json({ payer: verified }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
