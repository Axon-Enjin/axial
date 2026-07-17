import { NextResponse } from "next/server";
import { listPendingRegistrations } from "@/lib/settlement/pending-registration";

export const dynamic = "force-dynamic";

export async function GET() {
  const pending = await listPendingRegistrations();
  return NextResponse.json({ pending });
}
