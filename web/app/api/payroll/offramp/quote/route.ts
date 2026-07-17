import { NextResponse } from "next/server";
import { getFiatOfframp } from "@/lib/payroll/fiat-offramp";

export async function GET(request: Request) {
  const usdc = Number(new URL(request.url).searchParams.get("usdc") ?? "0");
  if (!Number.isFinite(usdc) || usdc <= 0) {
    return NextResponse.json({ error: "usdc must be a positive number" }, { status: 400 });
  }
  const quote = await getFiatOfframp().quoteUsdcToPhp(usdc);
  return NextResponse.json({
    quote,
    note: "Mock Track B rail — live PDAX/VASP gated on partner access + counsel.",
  });
}
