import { NextResponse } from "next/server";
import { triggerEisFromChain } from "@/lib/eis/trigger";
import { resolveFaceUsdc } from "@/lib/fx/convert";
import { getInvoice, setInvoiceFaceUsdc } from "@/lib/invoices/store";
import { isReceivableChainEnabled } from "@/lib/soroban/config";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";
import { mintReceivableOnChain } from "@/lib/soroban/invoke-receivable";

type Body = {
  invoiceId?: string;
  /** PHP face from client; server converts to whole USDC for on-chain mint. */
  faceAmount?: number;
  /** Stored invoice ID — when set, rejects if already minted/funded. */
  sourceInvoiceId?: string;
  /**
   * Optional Freighter wallet public key. When present, the receivable SAC
   * token is minted directly to the user's self-custodied wallet.
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
  const sourceInvoiceId =
    body.sourceInvoiceId?.trim() ??
    (invoiceId ? invoiceId.replace(/-\d{10,}$/, "") : undefined);
  let facePhp = body.faceAmount;
  const msmePublicOverride = body.msmePublic?.trim() || undefined;

  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
  }

  let faceUsdc: number | null = null;
  if (sourceInvoiceId) {
    try {
      const inv = await getInvoice(sourceInvoiceId);
      if (inv) {
        if (inv.mintTxHash || inv.swapTxHash || inv.status === "settled") {
          return NextResponse.json(
            { error: "Invoice already minted or funded", code: "ALREADY_MINTED" },
            { status: 409 },
          );
        }
        facePhp = inv.face;
        faceUsdc = inv.faceUsdc;
      }
    } catch {
      // Keep client faceAmount
    }
  }

  if (!Number.isFinite(facePhp) || (facePhp ?? 0) <= 0) {
    return NextResponse.json(
      { error: "faceAmount must be a positive number" },
      { status: 400 },
    );
  }

  if (faceUsdc == null || faceUsdc <= 0) {
    const fx = await resolveFaceUsdc(facePhp!);
    faceUsdc = fx.faceUsdc;
  }
  if (faceUsdc <= 0) {
    return NextResponse.json(
      { error: "Converted USDC face must be positive" },
      { status: 400 },
    );
  }

  if (sourceInvoiceId) {
    try {
      await setInvoiceFaceUsdc(sourceInvoiceId, faceUsdc);
    } catch {
      // Non-fatal
    }
  }

  const cfg = await resolveSorobanConfig();

  if (!isReceivableChainEnabled(cfg)) {
    return NextResponse.json({
      mode: "demo",
      invoiceId,
      faceAmount: faceUsdc,
      facePhp,
      faceUsdc,
      message:
        "Demo tokenization recorded. Set RECEIVABLE_TOKEN_CONTRACT_ID and STELLAR_ISSUER_SECRET in web/.env.local.",
    });
  }

  try {
    const result = await mintReceivableOnChain(cfg, invoiceId, faceUsdc, msmePublicOverride);
    triggerEisFromChain(
      "receivable_minted",
      invoiceId,
      result.txHash,
      faceUsdc,
      cfg.network,
    );
    return NextResponse.json({
      mode: "on-chain",
      invoiceId,
      faceAmount: faceUsdc,
      facePhp,
      faceUsdc,
      txHash: result.txHash,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mint failed";
    const status = message.includes("already tokenized") ? 409 : 502;
    console.error("[receivable/mint]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
