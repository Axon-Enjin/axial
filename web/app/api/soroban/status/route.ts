import { NextResponse } from "next/server";
import { getEisStoreBackend } from "@/lib/eis/store";
import { getPublicChainStatus } from "@/lib/soroban/config";

export async function GET() {
  return NextResponse.json({
    ...getPublicChainStatus(),
    eisStore: getEisStoreBackend(),
  });
}
