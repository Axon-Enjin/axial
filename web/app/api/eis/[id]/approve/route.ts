import { NextResponse } from "next/server";
import { submitPreparedSubmission } from "@/lib/eis/oracle";
import { assertEisOperatorAccess } from "@/lib/eis/route-auth";
import { findSubmissionByIdOrPayloadId } from "@/lib/eis/store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const denied = await assertEisOperatorAccess("read");
  if (denied) return denied;

  const { id } = await context.params;
  const key = id?.trim();
  if (!key) {
    return NextResponse.json({ error: "Submission id is required" }, { status: 400 });
  }

  const sub = await findSubmissionByIdOrPayloadId(key);
  if (!sub) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (
    sub.status !== "prepared" &&
    sub.status !== "failed" &&
    sub.status !== "submitted"
  ) {
    return NextResponse.json(
      {
        error: `Submission is "${sub.status}" — approve only for prepared, failed, or stuck submitted`,
        id: sub.id,
        payloadId: sub.payloadId,
        status: sub.status,
      },
      { status: 409 },
    );
  }

  try {
    const updated = await submitPreparedSubmission(sub);
    return NextResponse.json({
      id: updated.id,
      payloadId: updated.payloadId,
      status: updated.status,
      birReferenceId: updated.birReferenceId,
      memoTxHash: updated.memoTxHash,
      submittedAt: updated.submittedAt,
      error: updated.error,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "EIS approve failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
