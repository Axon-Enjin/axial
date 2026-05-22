import { NextResponse } from "next/server";
import { getConfirmationByReceivable, issueNoa } from "@/lib/payers/store";

type RouteContext = { params: Promise<{ receivableId: string }> };

/**
 * POST /api/noa/:receivableId/issue
 * Issues a Notice of Assignment for an invoice that has a confirmed payer.
 * NoA is idempotent — calling again returns the existing record unchanged.
 * The lockbox_address in the NoA becomes the ONLY valid payment instruction.
 */
export async function POST(_req: Request, context: RouteContext) {
  const { receivableId } = await context.params;
  const decoded = decodeURIComponent(receivableId);

  try {
    const confirmation = await getConfirmationByReceivable(decoded);
    if (!confirmation || confirmation.status !== "confirmed") {
      return NextResponse.json(
        {
          error: "Payer must confirm the invoice before a NoA can be issued",
          confirmationStatus: confirmation?.status ?? null,
        },
        { status: 422 },
      );
    }

    const noa = await issueNoa({
      receivableId: decoded,
      payerId: confirmation.payerId,
    });

    return NextResponse.json({ noa });
  } catch (err) {
    const message = err instanceof Error ? err.message : "NoA issue failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
