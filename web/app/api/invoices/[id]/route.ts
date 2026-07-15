import { NextResponse } from "next/server";
import {
  confirmPayerInvoice,
  getInvoice,
  markCollectedInvoice,
  settleInvoice,
} from "@/lib/invoices/store";
import { deriveDemoLockbox, parseNetDays } from "@/lib/msme/invoice-trust";
import { markEntrySettled, upsertReserveEntry } from "@/lib/settlement/store";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";
import { isSettlementChainEnabled, settleOnChain } from "@/lib/soroban/invoke-settlement";
import { toClientInvoice } from "@/lib/invoices/types";
import { quoteAdvance } from "@/lib/soroban/quote";

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = {
  action?: "confirm_payer" | "mark_collected" | "settle";
  immediate?: number;
  mintTxHash?: string | null;
  swapTxHash?: string | null;
  /** Chain-scoped id passed to settlement::register_invoice */
  onChainInvoiceId?: string | null;
  /** Gross collected amount (for mark_collected settlement path) */
  collectedAmount?: number;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const decoded = decodeURIComponent(id);

  try {
    const inv = await getInvoice(decoded);
    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ invoice: toClientInvoice(inv) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Get failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const decoded = decodeURIComponent(id);

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    let inv;
    switch (body.action) {
      case "confirm_payer":
        inv = await confirmPayerInvoice(decoded);
        break;
      case "mark_collected": {
        inv = await markCollectedInvoice(decoded);
        const cfg = await resolveSorobanConfig();
        const collected = body.collectedAmount ?? inv.face;
        const settleId = inv.onChainInvoiceId ?? decoded;

        let settlement:
          | {
              txHash: string;
              effectiveCollected: number;
              lockboxBalance: number;
              skipped?: boolean;
              error?: string;
            }
          | undefined;

        try {
          await markEntrySettled(decoded, { collectedAmount: collected });
        } catch (ledgerErr) {
          const msg =
            ledgerErr instanceof Error ? ledgerErr.message : "Reserve ledger update failed";
          return NextResponse.json(
            { error: msg, invoice: toClientInvoice(inv) },
            { status: 409 },
          );
        }

        if (isSettlementChainEnabled(cfg)) {
          try {
            const result = await settleOnChain(cfg, settleId, collected);
            await markEntrySettled(decoded, {
              collectedAmount: result.effectiveCollected,
              settlementTxHash: result.txHash,
            });
            settlement = {
              txHash: result.txHash,
              effectiveCollected: result.effectiveCollected,
              lockboxBalance: result.lockboxBalance,
            };
          } catch (settleErr) {
            const msg =
              settleErr instanceof Error ? settleErr.message : "On-chain settle failed";
            settlement = { txHash: "", effectiveCollected: 0, lockboxBalance: 0, error: msg };
            return NextResponse.json(
              {
                invoice: toClientInvoice(inv),
                settlement,
                warning: msg,
              },
              { status: 502 },
            );
          }
        } else {
          settlement = {
            txHash: "",
            effectiveCollected: collected,
            lockboxBalance: 0,
            skipped: true,
          };
        }

        return NextResponse.json({
          invoice: toClientInvoice(inv),
          settlement,
        });
      }
      case "settle": {
        const immediate = body.immediate;
        if (!Number.isFinite(immediate) || (immediate ?? 0) <= 0) {
          return NextResponse.json(
            { error: "immediate must be a positive number for settle" },
            { status: 400 },
          );
        }
        inv = await settleInvoice(decoded, {
          immediate: immediate!,
          mintTxHash: body.mintTxHash,
          swapTxHash: body.swapTxHash,
          onChainInvoiceId: body.onChainInvoiceId,
        });
        // Create reserve ledger entry (fire-and-forget)
        void (async () => {
          try {
            const invoice = await getInvoice(decoded);
            if (!invoice) return;
            const cfg = await resolveSorobanConfig();
            const { advance, reserve } = quoteAdvance(invoice.face);
            const { address: lockboxAddress } = deriveDemoLockbox(decoded);
            const netDays = parseNetDays(invoice.terms);
            const dueDate = new Date(Date.now() + netDays * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10);
            await upsertReserveEntry({
              receivableId: decoded,
              faceAmount: invoice.face,
              advanceAmount: advance,
              reserveHeld: reserve,
              funderAddress: cfg.funderPublic ?? "DEMO_FUNDER",
              msmeAddress: cfg.msmePublic ?? "DEMO_MSME",
              lockboxAddress: cfg.settlementContractId ?? lockboxAddress,
              shortfall: 0,
              dueDate,
              recourseStatus: "none",
              settlementTxHash: body.swapTxHash ?? null,
              collectedAmount: null,
              leakageDetectedAt: null,
              releasedAt: null,
            });
          } catch {
            // Non-fatal — reserve ledger is advisory
          }
        })();
        break;
      }
      default:
        return NextResponse.json(
          { error: "action must be confirm_payer, mark_collected, or settle" },
          { status: 400 },
        );
    }

    return NextResponse.json({ invoice: toClientInvoice(inv) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
