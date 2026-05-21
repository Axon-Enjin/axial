import { NextResponse } from "next/server";
import {
  confirmPayerInvoice,
  getInvoice,
  markCollectedInvoice,
  settleInvoice,
} from "@/lib/invoices/store";
import { toClientInvoice } from "@/lib/invoices/types";

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = {
  action?: "confirm_payer" | "mark_collected" | "settle";
  immediate?: number;
  mintTxHash?: string | null;
  swapTxHash?: string | null;
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
      case "mark_collected":
        inv = await markCollectedInvoice(decoded);
        break;
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
        });
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
