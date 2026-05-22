import { NextResponse } from "next/server";
import { acknowledgeNoa, getNoaByReceivable } from "@/lib/payers/store";
import { confirmPayerInvoice } from "@/lib/invoices/store";
import type { AckMethod } from "@/lib/payers/types";

type RouteContext = { params: Promise<{ receivableId: string }> };

type PostBody = {
  ackMethod?: AckMethod;
  /** Optional artifact reference for signed-PDF path */
  artifactRef?: string;
};

/**
 * GET /api/noa/:receivableId/ack — fetch current NoA status
 */
export async function GET(_req: Request, context: RouteContext) {
  const { receivableId } = await context.params;
  const decoded = decodeURIComponent(receivableId);

  try {
    const noa = await getNoaByReceivable(decoded);
    return NextResponse.json({ noa });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Get failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/**
 * POST /api/noa/:receivableId/ack
 * Payer e-acknowledges the NoA. This is the final gate before funding.
 * On success: also updates the parent invoice to payerConfirmed + noaAcknowledged
 * so the existing eligibility fast-path works too.
 */
export async function POST(request: Request, context: RouteContext) {
  const { receivableId } = await context.params;
  const decoded = decodeURIComponent(receivableId);

  let body: PostBody = {};
  try {
    body = (await request.json()) as PostBody;
  } catch {
    // body is optional — default to in_app
  }

  const method: AckMethod = body.ackMethod ?? "in_app";

  try {
    const noa = await acknowledgeNoa(decoded, method);

    // Mirror the ack onto the parent invoice so legacy eligibility fast-path works
    try {
      await confirmPayerInvoice(decoded);
    } catch {
      // Non-fatal: invoice may not exist in the file store (on-chain only path)
    }

    return NextResponse.json({ noa, fundable: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Acknowledgement failed";
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
