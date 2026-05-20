import { NextResponse } from "next/server";
import { getSorobanConfig, isReceivableChainEnabled } from "@/lib/soroban/config";
import { mintReceivableOnChain } from "@/lib/soroban/invoke-receivable";

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

  if (!isReceivableChainEnabled(cfg)) {
    return NextResponse.json({
      mode: "demo",
      invoiceId,
      faceAmount,
      message:
        "Demo tokenization recorded. Set RECEIVABLE_TOKEN_CONTRACT_ID and STELLAR_ISSUER_SECRET in web/.env.local.",
    });
  }

  try {
    const result = await mintReceivableOnChain(cfg, invoiceId, faceAmount!);
    return NextResponse.json({
      mode: "on-chain",
      invoiceId,
      faceAmount,
      txHash: result.txHash,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mint failed";
    const status = message.includes("already tokenized") ? 409 : 502;
    console.error("[receivable/mint]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
