import { NextResponse } from "next/server";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";
import { quoteAdvance } from "@/lib/soroban/quote";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const faceRaw = searchParams.get("face");
  const face = faceRaw ? Number(faceRaw) : NaN;

  if (!Number.isFinite(face) || face <= 0) {
    return NextResponse.json(
      { error: "Query param `face` must be a positive number" },
      { status: 400 },
    );
  }

  const cfg = await resolveSorobanConfig();
  const { advance, reserve, advanceBps } = quoteAdvance(face);

  return NextResponse.json({
    mode: cfg.swapContractId ? "contract-ready" : "local",
    configSource: cfg.configSource,
    faceAmount: face,
    advanceAmount: advance,
    reserveAmount: reserve,
    advanceBps,
    contractId: cfg.swapContractId,
  });
}
