import { NextResponse } from "next/server";
import { deriveDemoLockbox } from "@/lib/msme/invoice-trust";
import { getConfirmationByReceivable, issueNoa } from "@/lib/payers/store";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";

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

    const cfg = await resolveSorobanConfig();
    const lockboxAddress =
      cfg.settlementContractId ?? deriveDemoLockbox(decoded).address;
    const noa = await issueNoa({
      receivableId: decoded,
      payerId: confirmation.payerId,
      lockboxAddress,
    });

    return NextResponse.json({ noa });
  } catch (err) {
    const message = err instanceof Error ? err.message : "NoA issue failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
