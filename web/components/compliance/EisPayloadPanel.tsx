"use client";

import { useState } from "react";
import { EIS_PAYLOAD_FIELDS, formatPayloadValue } from "@/lib/eis/payload-fields";
import type { BirEisPayload } from "@/lib/eis/types";

type Props = {
  payload: BirEisPayload;
  payloadId: string;
  /** Store uuid — used for Approve POST. */
  submissionId?: string;
  pipelineStatus?: string;
  eventKind?: string;
  stellarTxHash?: string;
  memoTxHash?: string | null;
  memoText?: string | null;
  jwsPreview?: string;
  explorerTxBase: string;
  onClose: () => void;
  onApproved?: () => void;
};

export function EisPayloadPanel({
  payload,
  payloadId,
  submissionId,
  pipelineStatus,
  eventKind,
  stellarTxHash,
  memoTxHash,
  memoText,
  jwsPreview,
  explorerTxBase,
  onClose,
  onApproved,
}: Props) {
  const groups = [...new Set(EIS_PAYLOAD_FIELDS.map((f) => f.group))];
  const canApprove = pipelineStatus === "prepared" && Boolean(submissionId);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  async function handleApprove() {
    if (!submissionId || approving) return;
    setApproving(true);
    setApproveError(null);
    try {
      const res = await fetch(`/api/eis/${submissionId}/approve`, { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setApproveError(data.error ?? "Approve failed");
        return;
      }
      onApproved?.();
    } catch {
      setApproveError("Approve request failed");
    } finally {
      setApproving(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#2DD4BF]/20 bg-surface-container-low/80 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-label-sm text-label-sm uppercase tracking-wider text-[#2DD4BF]">
            BIR EIS payload — auto-mapped
          </div>
          <div className="mt-1 font-mono text-sm text-on-surface">{payloadId}</div>
          {eventKind ? (
            <div className="mt-0.5 font-body-md text-body-md text-on-surface-variant">
              Oracle source: {eventKind.replace(/_/g, " ")}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canApprove ? (
            <button
              type="button"
              disabled={approving}
              onClick={(e) => {
                e.stopPropagation();
                void handleApprove();
              }}
              className="rounded-lg bg-[#2DD4BF] px-3 py-1.5 font-label-sm text-label-sm font-medium text-surface transition hover:bg-[#2DD4BF]/90 disabled:opacity-60"
            >
              {approving ? "Submitting…" : "Approve"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant/20 px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition hover:border-outline-variant/40 hover:text-on-surface"
          >
            Collapse
          </button>
        </div>
      </div>

      {approveError ? (
        <p className="mb-3 font-body-md text-body-md text-red-400/90">{approveError}</p>
      ) : null}

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group}>
            <div className="mb-2 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              {group}
            </div>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {EIS_PAYLOAD_FIELDS.filter((f) => f.group === group).map(({ key, label }) => (
                <div
                  key={key}
                  className="rounded-lg border border-outline-variant/10 bg-surface/40 px-3 py-2"
                >
                  <dt className="font-label-sm text-label-sm text-on-surface-variant">{label}</dt>
                  <dd
                    className={[
                      "mt-0.5 break-all font-body-md text-body-md text-on-surface",
                      key === "stellarTxHash" ? "font-mono text-xs" : "",
                    ].join(" ")}
                  >
                    {formatPayloadValue(key, payload[key])}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 border-t border-outline-variant/10 pt-4 font-label-sm text-label-sm">
        {stellarTxHash ? (
          <a
            href={`${explorerTxBase}/${stellarTxHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-[#2DD4BF] hover:underline"
          >
            Source ledger tx
          </a>
        ) : null}
        {memoTxHash ? (
          <a
            href={`${explorerTxBase}/${memoTxHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-[#2DD4BF] hover:underline"
          >
            Memo write-back tx
          </a>
        ) : null}
        {memoText ? (
          <span className="text-on-surface-variant">
            Memo: <span className="font-mono text-on-surface">{memoText}</span>
          </span>
        ) : null}
      </div>

      {jwsPreview ? (
        <div className="mt-3 rounded-lg border border-outline-variant/10 bg-surface/30 p-3">
          <div className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            JWS (secured payload)
          </div>
          <code className="block break-all font-mono text-[10px] leading-relaxed text-on-surface-variant">
            {jwsPreview}
          </code>
        </div>
      ) : null}
    </div>
  );
}
