import { NextResponse } from "next/server";
import { getPayer, updatePayerKyb } from "@/lib/payers/store";
import type { KybStatus } from "@/lib/payers/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const payer = await getPayer(id);
    if (!payer) {
      return NextResponse.json({ error: "Payer not found" }, { status: 404 });
    }
    return NextResponse.json({ payer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Get failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

type PatchBody = { kybStatus?: KybStatus };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.kybStatus || !["pending", "verified", "rejected"].includes(body.kybStatus)) {
    return NextResponse.json(
      { error: "kybStatus must be pending | verified | rejected" },
      { status: 400 },
    );
  }

  try {
    const payer = await updatePayerKyb(id, body.kybStatus);
    return NextResponse.json({ payer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
