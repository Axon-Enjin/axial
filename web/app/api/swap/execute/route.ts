import { NextResponse } from "next/server";
import { triggerEisFromChain } from "@/lib/eis/trigger";
import { resolveFaceUsdc } from "@/lib/fx/convert";
import { getInvoice, setInvoiceFaceUsdc } from "@/lib/invoices/store";
import { emitFunded } from "@/lib/notifications/emit";
import { resolveOrgId } from "@/lib/org/store";
import { checkFundingEligibility } from "@/lib/payers/eligibility";
import { isSwapChainEnabled } from "@/lib/soroban/config";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";
import { executeAdvanceOnChain } from "@/lib/soroban/invoke-swap";
import {
  isSettlementChainEnabled,
  registerInvoiceOnChain,
} from "@/lib/soroban/invoke-settlement";
import { enqueuePendingRegistration } from "@/lib/settlement/pending-registration";
import { quoteAdvance } from "@/lib/soroban/quote";
import { assertSwapPreflight } from "@/lib/soroban/usdc-preflight";

type Body = {
  invoiceId?: string;
  /** PHP face from client; ignored when source invoice has face / faceUsdc. */
  faceAmount?: number;
  /** Stored invoice ID for eligibility + double-advance guards. */
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
  const explicitSourceId = body.sourceInvoiceId?.trim() || undefined;
  const sourceInvoiceId =
    explicitSourceId ??
    (invoiceId ? invoiceId.replace(/-\d{10,}$/, "") : undefined);
  const msmePublicOverride = body.msmePublic?.trim() || undefined;
  const seedAllowed = process.env.AXIAL_ALLOW_SEED === "true";

  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
  }

  if (!seedAllowed) {
    if (!explicitSourceId) {
      return NextResponse.json(
        { error: "sourceInvoiceId is required" },
        { status: 400 },
      );
    }
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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Eligibility check failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  } else if (sourceInvoiceId) {
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
      // Non-fatal in seed mode (e.g. invoice not yet in store)
    }
  }

  let facePhp = body.faceAmount;
  let faceUsdc: number | null = null;
  let sourceInvoice = null as Awaited<ReturnType<typeof getInvoice>>;

  if (sourceInvoiceId) {
    try {
      sourceInvoice = await getInvoice(sourceInvoiceId);
      if (sourceInvoice) {
        if (sourceInvoice.swapTxHash || sourceInvoice.status === "settled") {
          return NextResponse.json(
            { error: "Invoice already funded", code: "ALREADY_FUNDED" },
            { status: 409 },
          );
        }
        facePhp = sourceInvoice.face;
        faceUsdc = sourceInvoice.faceUsdc;
      }
    } catch {
      // Keep client faceAmount if store lookup fails
    }
  }

  if (!Number.isFinite(facePhp) || (facePhp ?? 0) <= 0) {
    return NextResponse.json(
      { error: "faceAmount must be a positive number" },
      { status: 400 },
    );
  }

  let phpPerUsdc: number | null = null;
  let fxSource: string | null = null;
  if (faceUsdc == null || faceUsdc <= 0) {
    const fx = await resolveFaceUsdc(facePhp!);
    faceUsdc = fx.faceUsdc;
    phpPerUsdc = fx.phpPerUsdc;
    fxSource = fx.source;
  }
  if (faceUsdc <= 0) {
    return NextResponse.json(
      { error: "Converted USDC face must be positive" },
      { status: 400 },
    );
  }

  if (sourceInvoiceId && sourceInvoice && sourceInvoice.faceUsdc == null) {
    try {
      await setInvoiceFaceUsdc(sourceInvoiceId, faceUsdc);
    } catch {
      // Non-fatal — swap can proceed; settle path may persist later
    }
  }

  const cfg = await resolveSorobanConfig();
  const quote = quoteAdvance(faceUsdc);

  if (!isSwapChainEnabled(cfg)) {
    return NextResponse.json({
      mode: "demo",
      invoiceId,
      faceAmount: faceUsdc,
      facePhp,
      faceUsdc,
      phpPerUsdc,
      fxSource,
      advanceAmount: quote.advance,
      reserveAmount: quote.reserve,
      message:
        "Demo swap recorded locally. Set AXIAL_SWAP_CONTRACT_ID and funder keys in .env.local for on-chain execution.",
    });
  }

  const msmeRecipient = msmePublicOverride ?? cfg.msmePublic;
  if (msmeRecipient) {
    const preflight = await assertSwapPreflight(cfg, msmeRecipient, faceUsdc);
    if (!preflight.ok) {
      return NextResponse.json(
        { error: preflight.message, code: preflight.code },
        { status: 409 },
      );
    }
  }

  try {
    const onChain = await executeAdvanceOnChain(cfg, invoiceId, faceUsdc, msmePublicOverride);

    let registrationPending = false;
    let registrationError: string | undefined;
    if (isSettlementChainEnabled(cfg)) {
      try {
        const reg = await registerInvoiceOnChain(cfg, invoiceId, faceUsdc, quote.advance);
        console.info("[swap/execute] register_invoice tx", reg.txHash);
      } catch (regErr) {
        const regMsg =
          regErr instanceof Error ? regErr.message : "register_invoice failed";
        console.error("[swap/execute] register_invoice failed:", regMsg);
        await enqueuePendingRegistration({
          invoiceId,
          swapTxHash: onChain.txHash,
          faceUsdc,
          advance: quote.advance,
          lastError: regMsg,
        });
        registrationPending = true;
        registrationError = regMsg;
      }
    }

    triggerEisFromChain(
      "swap_executed",
      invoiceId,
      onChain.txHash,
      faceUsdc,
      cfg.network,
      quote.advance,
    );
    emitFunded(resolveOrgId(), sourceInvoiceId ?? invoiceId, quote.advance);
    return NextResponse.json({
      mode: "on-chain",
      invoiceId,
      faceAmount: faceUsdc,
      facePhp,
      faceUsdc,
      phpPerUsdc,
      fxSource,
      advanceAmount: quote.advance,
      reserveAmount: quote.reserve,
      txHash: onChain.txHash,
      registrationPending,
      registrationError,
      code: registrationPending ? "REGISTER_INVOICE_PENDING" : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Swap failed";
    const status = message.includes("already funded") ? 409 : 502;
    console.error("[swap/execute]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
