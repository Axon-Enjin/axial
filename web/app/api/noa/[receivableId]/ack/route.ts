import { NextResponse } from "next/server";
import {
  acknowledgeNoa,
  getConfirmationByToken,
  getNoaByReceivable,
} from "@/lib/payers/store";
import { confirmPayerInvoice } from "@/lib/invoices/store";
import type { AckMethod } from "@/lib/payers/types";

type RouteContext = { params: Promise<{ receivableId: string }> };

type PostBody = {
  /** Payer confirmation authToken — required for ack. */
  token?: string;
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
 * Requires the payer confirmation authToken matching this receivable.
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
    // body may be empty
  }

  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json(
      { error: "token is required" },
      { status: 401 },
    );
  }

  try {
    const confirmation = await getConfirmationByToken(token);
    if (!confirmation) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation token" },
        { status: 401 },
      );
    }
    if (confirmation.receivableId !== decoded) {
      return NextResponse.json(
        { error: "Token does not match this receivable" },
        { status: 403 },
      );
    }
    if (confirmation.status !== "confirmed") {
      return NextResponse.json(
        { error: "Invoice must be confirmed before NoA acknowledgement" },
        { status: 409 },
      );
    }

    const method: AckMethod = body.ackMethod ?? "in_app";
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
