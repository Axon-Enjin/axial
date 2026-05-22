import { NextResponse } from "next/server";
import { getInvoice } from "@/lib/invoices/store";
import { deriveDemoLockbox } from "@/lib/msme/invoice-trust";
import {
  confirmInvoiceByToken,
  getConfirmationByReceivable,
  issueNoa,
  requestConfirmation,
} from "@/lib/payers/store";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";

type RouteContext = { params: Promise<{ id: string }> };

type PostBody = {
  /** Payer-auth token — payer is confirming the invoice. */
  token?: string;
  /** MSME is requesting confirmation and linking a payer. */
  payerId?: string;
  confirmedAmount?: number;
  dueDate?: string;
};

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const decoded = decodeURIComponent(id);
  try {
    const confirmation = await getConfirmationByReceivable(decoded);
    return NextResponse.json({ confirmation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Get failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const decoded = decodeURIComponent(id);

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    // Path A: payer uses their scoped auth token to confirm
    if (body.token) {
      const confirmation = await confirmInvoiceByToken(body.token);
      if (confirmation.receivableId !== decoded) {
        return NextResponse.json(
          { error: "Token does not match this invoice" },
          { status: 403 },
        );
      }
      // Auto-issue NoA when payer confirms
      const cfg = await resolveSorobanConfig();
      const lockboxAddress =
        cfg.settlementContractId ?? deriveDemoLockbox(decoded).address;
      const noa = await issueNoa({
        receivableId: decoded,
        payerId: confirmation.payerId,
        lockboxAddress,
      });
      return NextResponse.json({ confirmation, noa });
    }

    // Path B: MSME requests payer confirmation (sends link to payer)
    if (body.payerId) {
      const invoice = await getInvoice(decoded);
      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }
      const confirmedAmount = body.confirmedAmount ?? invoice.face;
      const dueDate =
        body.dueDate ?? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const confirmation = await requestConfirmation({
        receivableId: decoded,
        payerId: body.payerId,
        confirmedAmount,
        dueDate,
      });
      return NextResponse.json({
        confirmation,
        authLink: `/app/payer-portal?token=${confirmation.authToken}&invoice=${decoded}`,
      });
    }

    return NextResponse.json(
      { error: "Provide token (payer confirms) or payerId (MSME requests)" },
      { status: 400 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Confirmation failed";
    if (message.includes("Invalid") || message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
