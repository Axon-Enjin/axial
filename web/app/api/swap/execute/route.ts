import { NextResponse } from "next/server";
import { getSorobanConfig, isSwapChainEnabled } from "@/lib/soroban/config";
import { executeAdvanceOnChain } from "@/lib/soroban/invoke-swap";
import { quoteAdvance } from "@/lib/soroban/quote";

type Body = {
  invoiceId?: string;
  faceAmount?: number;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const invoiceId = body.invoiceId?.trim();
  const faceAmount = body.faceAmount;

  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
  }
  if (!Number.isFinite(faceAmount) || (faceAmount ?? 0) <= 0) {
    return NextResponse.json(
      { error: "faceAmount must be a positive number" },
      { status: 400 },
    );
  }

  const cfg = getSorobanConfig();
  const quote = quoteAdvance(faceAmount!);

  if (!isSwapChainEnabled(cfg)) {
    return NextResponse.json({
      mode: "demo",
      invoiceId,
      faceAmount,
      advanceAmount: quote.advance,
      reserveAmount: quote.reserve,
      message:
        "Demo swap recorded locally. Set AXIAL_SWAP_CONTRACT_ID and funder keys in .env.local for on-chain execution.",
    });
  }

  try {
    const onChain = await executeAdvanceOnChain(cfg, invoiceId, faceAmount!);
    return NextResponse.json({
      mode: "on-chain",
      invoiceId,
      faceAmount,
      advanceAmount: quote.advance,
      reserveAmount: quote.reserve,
      txHash: onChain.txHash,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Swap failed";
    const status = message.includes("already funded") ? 409 : 502;
    console.error("[swap/execute]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
