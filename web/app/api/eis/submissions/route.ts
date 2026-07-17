import { NextResponse } from "next/server";
import { assertEisOperatorAccess } from "@/lib/eis/route-auth";
import { getEisStoreBackend, listSubmissions } from "@/lib/eis/store";

export async function GET() {
  const denied = await assertEisOperatorAccess("read");
  if (denied) return denied;

  const submissions = await listSubmissions(50);

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
