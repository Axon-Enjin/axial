import { NextResponse } from "next/server";
import { processLedgerEvent } from "@/lib/eis/oracle";
import { assertEisOperatorAccess } from "@/lib/eis/route-auth";
import type { ChainLedgerEvent, LedgerEventKind } from "@/lib/eis/types";

type Body = {
  kind?: LedgerEventKind;
  referenceId?: string;
  stellarTxHash?: string;
  amount?: number;
};

export async function POST(request: Request) {
  const denied = await assertEisOperatorAccess("operator");
  if (denied) return denied;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { kind, referenceId, stellarTxHash, amount } = body;

  if (!kind || !referenceId || !stellarTxHash || !Number.isFinite(amount)) {
    return NextResponse.json(
      { error: "kind, referenceId, stellarTxHash, and amount are required" },
      { status: 400 },
    );
  }

  try {
    const event: ChainLedgerEvent = {
      kind,
      referenceId: referenceId.trim(),
      stellarTxHash: stellarTxHash.trim(),
      amount: amount!,
    };
    const sub = await processLedgerEvent(event);
    return NextResponse.json({
      id: sub.id,
      payloadId: sub.payloadId,
      status: sub.status,
      birReferenceId: sub.birReferenceId,
      memoTxHash: sub.memoTxHash,
      stellarTxHash: sub.stellarTxHash,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "EIS process failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
