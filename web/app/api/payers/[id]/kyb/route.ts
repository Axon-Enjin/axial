import { NextResponse } from "next/server";
import { createKybProvider } from "@/lib/payers/kyb";
import { getPayer } from "@/lib/payers/store";
import type { KybStatus } from "@/lib/payers/types";

type PatchBody = { status?: KybStatus };

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = body.status;
  if (status !== "verified" && status !== "rejected" && status !== "pending") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const payer = await getPayer(id);
  if (!payer) {
    return NextResponse.json({ error: "Payer not found" }, { status: 404 });
  }

  const provider = createKybProvider();
  if (provider.mode === "mock" && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Manual KYB review required — set AXIAL_KYB_MODE=manual" },
      { status: 403 },
    );
  }

  await provider.setStatus(id, status);
  const updated = await getPayer(id);
  return NextResponse.json({ payer: updated });
}
