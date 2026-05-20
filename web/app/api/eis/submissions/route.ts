import { NextResponse } from "next/server";
import { getEisStoreBackend, listSubmissions } from "@/lib/eis/store";

export async function GET() {
  const submissions = await listSubmissions(50);

  const rows = submissions.map((s) => ({
    id: s.payloadId,
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
    eventKind: s.eventKind,
    referenceId: s.referenceId,
  }));

  const pending = submissions.filter(
    (s) => s.status !== "memo_written" && s.status !== "failed",
  ).length;
  const synchronized = submissions.filter((s) => s.status === "memo_written").length;

  return NextResponse.json({
    store: getEisStoreBackend(),
    submissions: rows,
    stats: {
      pending,
      synchronized,
      total: submissions.length,
    },
  });
}

function uiStatus(
  status: string,
): "Synchronized" | "Bridging" | "Failed" {
  if (status === "memo_written") return "Synchronized";
  if (status === "failed") return "Failed";
  return "Bridging";
}
