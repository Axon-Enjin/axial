import { NextResponse } from "next/server";
import { getPublicChainStatus } from "@/lib/soroban/config";

export async function GET() {
  return NextResponse.json(getPublicChainStatus());
}
