import { NextResponse } from "next/server";
import { triggerEisFromChain } from "@/lib/eis/trigger";
import { checkFundingEligibility } from "@/lib/payers/eligibility";
import { isSwapChainEnabled } from "@/lib/soroban/config";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";
import { executeAdvanceOnChain } from "@/lib/soroban/invoke-swap";
import { quoteAdvance } from "@/lib/soroban/quote";

type Body = {
  invoiceId?: string;
  faceAmount?: number;
  /** Stored invoice ID (without timestamp suffix) for eligibility check. */
  sourceInvoiceId?: string;
  /**
   * Optional Freighter wallet public key. When present, the USDC advance
   * is routed to the user's self-custodied wallet (Freighter address)
   * instead of the server-managed MSME account.
   */
  msmePublic?: string;
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
  // sourceInvoiceId is the stored invoice ID; invoiceId is the chain-scoped one
  // (may carry a timestamp suffix). Fall back to stripping the suffix heuristically.
  const sourceInvoiceId =
    body.sourceInvoiceId?.trim() ??
    (invoiceId ? invoiceId.replace(/-\d{10,}$/, "") : undefined);
  // Freighter self-custody: override the MSME recipient with the user's own wallet
  const msmePublicOverride = body.msmePublic?.trim() || undefined;

  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
  }
  if (!Number.isFinite(faceAmount) || (faceAmount ?? 0) <= 0) {
    return NextResponse.json(
      { error: "faceAmount must be a positive number" },
      { status: 400 },
    );
  }

  // CLS-05 — funding eligibility gate (payer KYB + confirmation + NoA ack)
  if (sourceInvoiceId) {
    try {
      const eligibility = await checkFundingEligibility(sourceInvoiceId);
      if (!eligibility.fundable) {
        return NextResponse.json(
          {
            error: "NOT_FUNDABLE",
            blockers: eligibility.blockers,
            message:
              "Invoice is not eligible for funding. Complete payer KYB, invoice confirmation, and NoA acknowledgement.",
          },
          { status: 409 },
        );
      }
    } catch {
      // Non-fatal: if the eligibility check itself errors, allow the swap through
      // (e.g. invoice not yet in the store in pure on-chain mode)
    }
  }

  const cfg = await resolveSorobanConfig();
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
    const onChain = await executeAdvanceOnChain(cfg, invoiceId, faceAmount!, msmePublicOverride);
    triggerEisFromChain(
      "swap_executed",
      invoiceId,
      onChain.txHash,
      faceAmount!,
      cfg.network,
      quote.advance,
    );
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
