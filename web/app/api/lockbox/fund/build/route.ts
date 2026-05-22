/**
 * POST /api/lockbox/fund/build
 *
 * Builds an unsigned USDC SAC transfer XDR for the payer Freighter path.
 * The payer signs the returned XDR and submits via POST /api/tx/submit.
 */
import { NextResponse } from "next/server";
import { buildLockboxFundXdr } from "@/lib/soroban/build-tx";
import { isLockboxFundingEnabled } from "@/lib/soroban/config";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";

type Body = {
  invoiceId?: string;
  amount?: number;
  /** Freighter wallet public key — transaction source and USDC transfer sender. */
  payerPublic?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const invoiceId = body.invoiceId?.trim();
  const amount = body.amount;
  const payerPublic = body.payerPublic?.trim();

  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || (amount ?? 0) <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number" },
      { status: 400 },
    );
  }
  if (!payerPublic || payerPublic.length < 56) {
    return NextResponse.json(
      { error: "payerPublic (Freighter wallet public key) is required" },
      { status: 400 },
    );
  }

  const cfg = await resolveSorobanConfig();
  if (!isLockboxFundingEnabled(cfg)) {
    return NextResponse.json(
      {
        error:
          "Lockbox funding not configured. Set SETTLEMENT_CONTRACT_ID and USDC token in env.",
      },
      { status: 503 },
    );
  }

  try {
    const xdr = await buildLockboxFundXdr(cfg, payerPublic, amount!);
    return NextResponse.json({
      xdr,
      invoiceId,
      amount,
      lockboxAddress: cfg.settlementContractId,
      usdcAsset: cfg.usdcTokenId,
      network: cfg.network,
      networkPassphrase: cfg.networkPassphrase,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Build failed";
    console.error("[lockbox/fund/build]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
