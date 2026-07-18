import { NextResponse } from "next/server";
import { assertSessionAccess } from "@/lib/auth/session-gate";
import { getEisStoreBackend, listSubmissions } from "@/lib/eis/store";

export async function GET() {
  const gate = await assertSessionAccess("read");
  if (gate.denied) return gate.denied;

  const orgId = gate.user?.orgId ?? null;
  let submissions = await listSubmissions(50);
  if (orgId) {
    const prefix = `${orgId}:`;
    submissions = submissions.filter(
      (s) => s.idempotencyKey.startsWith(prefix) || !s.idempotencyKey.includes(":"),
    );
  }

  const rows = submissions.map((s) => ({
    id: s.id,
    payloadId: s.payloadId,
    date: new Date(s.createdAt).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    ref: s.birReferenceId ?? (s.status === "failed" ? "Failed" : "Pending…"),
    status: uiStatus(s.status),
    stellarTxHash: s.stellarTxHash,
    memoTxHash: s.memoTxHash,
    memoText: s.memoText,
    eventKind: s.eventKind,
    referenceId: s.referenceId,
    pipelineStatus: s.status,
    payload: s.payload,
    jwsPreview: truncateJws(s.jwsCompact),
    error: s.error,
    dueBy: s.dueBy ?? null,
  }));

  const pending = submissions.filter(
    (s) => s.status !== "memo_written" && s.status !== "failed",
  ).length;
  const synchronized = submissions.filter((s) => s.status === "memo_written").length;
  const failed = submissions.filter((s) => s.status === "failed").length;

  return NextResponse.json({
    store: getEisStoreBackend(),
    submissions: rows,
    stats: {
      pending,
      synchronized,
      failed,
      total: submissions.length,
    },
  });
}

function uiStatus(
  status: string,
): "Synchronized" | "Bridging" | "Awaiting review" | "Failed" {
  if (status === "memo_written") return "Synchronized";
  if (status === "failed") return "Failed";
  if (status === "prepared") return "Awaiting review";
  return "Bridging";
}

function truncateJws(jws: string, max = 120): string {
  if (jws.length <= max) return jws;
  return `${jws.slice(0, max)}…`;
}
