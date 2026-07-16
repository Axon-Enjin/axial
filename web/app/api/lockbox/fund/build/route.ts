/**
 * POST /api/lockbox/fund/build
 *
 * Builds an unsigned USDC SAC transfer XDR for the payer Freighter path.
 * Body `amount` is PHP face (or omit to use invoice.face). Server converts to
 * whole USDC units for the on-chain transfer. Response `amount` is USDC
 * (backward-compat field for the on-chain amount).
 */
import { NextResponse } from "next/server";
import { resolveFaceUsdc } from "@/lib/fx/convert";
import { attributeLockboxInflow, getInvoice } from "@/lib/invoices/store";
import { buildLockboxFundXdr } from "@/lib/soroban/build-tx";
import { isLockboxFundingEnabled } from "@/lib/soroban/config";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";

type Body = {
  invoiceId?: string;
  /** PHP face amount; falls back to invoice.face when omitted. */
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
  const payerPublic = body.payerPublic?.trim();

  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
  }
  if (!payerPublic || payerPublic.length < 56) {
    return NextResponse.json(
      { error: "payerPublic (Freighter wallet public key) is required" },
      { status: 400 },
    );
  }

  let invoice;
  try {
    invoice = await getInvoice(invoiceId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invoice lookup failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const amountPhp =
    Number.isFinite(body.amount) && (body.amount ?? 0) > 0 ? body.amount! : invoice.face;
  if (!Number.isFinite(amountPhp) || amountPhp <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive PHP face amount" },
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
    const fx = await resolveFaceUsdc(amountPhp);
    const amountUsdc = fx.faceUsdc;
    if (amountUsdc <= 0) {
      return NextResponse.json(
        { error: "Converted USDC amount must be positive" },
        { status: 400 },
      );
    }

    const xdr = await buildLockboxFundXdr(cfg, payerPublic, amountUsdc);
    await attributeLockboxInflow(invoiceId, amountUsdc);

    return NextResponse.json({
      xdr,
      invoiceId,
      /** On-chain USDC amount (whole units); kept as `amount` for backward compat. */
      amount: amountUsdc,
      amountPhp,
      amountUsdc,
      phpPerUsdc: fx.phpPerUsdc,
      fxSource: fx.source,
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
