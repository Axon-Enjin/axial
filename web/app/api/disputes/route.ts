import { NextResponse } from "next/server";
import { disputeInvoiceByToken, listDisputesForReceivable } from "@/lib/payers/disputes";
import { emitDisputed } from "@/lib/notifications/emit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const receivableId = searchParams.get("receivableId");
  if (!receivableId) {
    return NextResponse.json({ error: "receivableId required" }, { status: 400 });
  }

  try {
    const disputes = await listDisputesForReceivable(receivableId);
    return NextResponse.json({ disputes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "List failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

type PostBody = {
  token?: string;
  reason?: string;
};

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  try {
    const { receivableId } = await disputeInvoiceByToken(token, body.reason ?? "");
    emitDisputed(process.env.AXIAL_ORG_ID, receivableId);
    return NextResponse.json({ receivableId, status: "disputed" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Dispute failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
