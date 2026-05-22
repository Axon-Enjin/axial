import { NextResponse } from "next/server";
import { getEisStoreBackend } from "@/lib/eis/store";
import { resolvePublicChainStatus } from "@/lib/soroban/server-config";

export async function GET() {
  return NextResponse.json({
    ...(await resolvePublicChainStatus()),
    eisStore: getEisStoreBackend(),
  });
}
