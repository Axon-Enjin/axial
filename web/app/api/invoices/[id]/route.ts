import { NextResponse } from "next/server";
import {
  beginCollectingInvoice,
  confirmPayerInvoice,
  getInvoice,
  markCollectedInvoice,
  revertCollectingInvoice,
  settleInvoice,
} from "@/lib/invoices/store";
import { resolveFaceUsdc } from "@/lib/fx/convert";
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
  /** Gross collected amount (PHP face or USDC whole units) */
  collectedAmount?: number;
  faceUsdc?: number | null;
};

const COLLECT_EPSILON = 1;

async function resolveMaxCollectableUsdc(inv: {
  face: number;
  faceUsdc: number | null;
  attributedInflowUsdc: number | null;
}): Promise<number> {
  if (inv.attributedInflowUsdc != null && inv.attributedInflowUsdc > 0) {
    return Math.trunc(inv.attributedInflowUsdc);
  }
  if (inv.faceUsdc != null && inv.faceUsdc > 0) {
    return Math.trunc(inv.faceUsdc);
  }
  const fx = await resolveFaceUsdc(inv.face);
  return fx.faceUsdc;
}

async function resolveCollectedUsdc(
  inv: { face: number; faceUsdc: number | null },
  collectedAmount: number | undefined,
): Promise<number> {
  if (collectedAmount == null || !Number.isFinite(collectedAmount)) {
    if (inv.faceUsdc != null && inv.faceUsdc > 0) return Math.trunc(inv.faceUsdc);
    const fx = await resolveFaceUsdc(inv.face);
    return fx.faceUsdc;
  }
  // Client still sends PHP face when amount === invoice.face
  if (collectedAmount === inv.face) {
    if (inv.faceUsdc != null && inv.faceUsdc > 0) return Math.trunc(inv.faceUsdc);
    const fx = await resolveFaceUsdc(inv.face);
    return fx.faceUsdc;
  }
  return Math.trunc(collectedAmount);
}

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
        if (process.env.AXIAL_ALLOW_SEED !== "true") {
          return NextResponse.json(
            {
              error:
                "Demo confirm_payer is seed-only. Set AXIAL_ALLOW_SEED=true, or use the payer confirmation + NoA flow.",
            },
            { status: 403 },
          );
        }
        inv = await confirmPayerInvoice(decoded);
        break;
      case "mark_collected": {
        const existing = await getInvoice(decoded);
        if (!existing) {
          return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }
        if (existing.collectionStatus === "collected") {
          return NextResponse.json({ invoice: toClientInvoice(existing) });
        }

        const settleCfg = await resolveSorobanConfig();
        if (
          isSettlementChainEnabled(settleCfg) &&
          (existing.attributedInflowUsdc == null || existing.attributedInflowUsdc <= 0)
        ) {
          return NextResponse.json(
            {
              error:
                "No confirmed lockbox inflow for this invoice yet. Complete Freighter payment first.",
              code: "NEED_LOCKBOX_INFLOW",
            },
            { status: 409 },
          );
        }

        const maxCollectable = await resolveMaxCollectableUsdc(existing);
        const collectedUsdc = await resolveCollectedUsdc(existing, body.collectedAmount);
        if (collectedUsdc > maxCollectable + COLLECT_EPSILON) {
          return NextResponse.json(
            {
              error: "Collected amount exceeds attributed lockbox inflow",
              code: "INFLOW_CAP",
              collectedUsdc,
              maxCollectable,
            },
            { status: 409 },
          );
        }
        const effectiveCollected = Math.min(collectedUsdc, maxCollectable);

        await beginCollectingInvoice(decoded);
        const settleId = existing.onChainInvoiceId ?? decoded;

        let settlement:
          | {
              txHash: string;
              effectiveCollected: number;
              lockboxBalance: number;
              skipped?: boolean;
              error?: string;
            }
          | undefined;

        if (isSettlementChainEnabled(settleCfg)) {
          try {
            const result = await settleOnChain(settleCfg, settleId, effectiveCollected);
            inv = await markCollectedInvoice(decoded);
            try {
              await markEntrySettled(decoded, {
                collectedAmount: result.effectiveCollected,
                settlementTxHash: result.txHash,
              });
            } catch (ledgerErr) {
              const msg =
                ledgerErr instanceof Error ? ledgerErr.message : "Reserve ledger update failed";
              return NextResponse.json(
                { error: msg, invoice: toClientInvoice(inv), settlement: {
                  txHash: result.txHash,
                  effectiveCollected: result.effectiveCollected,
                  lockboxBalance: result.lockboxBalance,
                } },
                { status: 409 },
              );
            }
            settlement = {
              txHash: result.txHash,
              effectiveCollected: result.effectiveCollected,
              lockboxBalance: result.lockboxBalance,
            };
          } catch (settleErr) {
            const msg =
              settleErr instanceof Error ? settleErr.message : "On-chain settle failed";
            inv = await revertCollectingInvoice(decoded, "open");
            settlement = {
              txHash: "",
              effectiveCollected: 0,
              lockboxBalance: 0,
              error: msg,
            };
            return NextResponse.json(
              {
                invoice: toClientInvoice(inv),
                settlement,
                error: msg,
              },
              { status: 502 },
            );
          }
        } else {
          inv = await markCollectedInvoice(decoded);
          try {
            await markEntrySettled(decoded, { collectedAmount: effectiveCollected });
          } catch (ledgerErr) {
            const msg =
              ledgerErr instanceof Error ? ledgerErr.message : "Reserve ledger update failed";
            return NextResponse.json(
              { error: msg, invoice: toClientInvoice(inv) },
              { status: 409 },
            );
          }
          settlement = {
            txHash: "",
            effectiveCollected,
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
          faceUsdc: body.faceUsdc,
        });
        try {
          const invoice = await getInvoice(decoded);
          if (invoice) {
            const cfg = await resolveSorobanConfig();
            const faceForLedger = invoice.faceUsdc ?? invoice.face;
            const { advance, reserve } = quoteAdvance(faceForLedger);
            const { address: lockboxAddress } = deriveDemoLockbox(decoded);
            const netDays = parseNetDays(invoice.terms);
            const dueDate = new Date(Date.now() + netDays * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10);
            await upsertReserveEntry({
              receivableId: decoded,
              faceAmount: faceForLedger,
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
          }
        } catch {
          // Non-fatal — reserve ledger is advisory, but awaited so mark_collected can find it
        }
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
    if (message.includes("already collected")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
