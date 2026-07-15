"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { TRUST_BOUNDARY_DRAFT } from "@/lib/org/types";

type Props = {
  onAcked?: () => void;
};

export function TrustBoundaryCard({ onAcked }: Props) {
  const [acked, setAcked] = useState(false);
  const [ackedAt, setAckedAt] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/org/trust-boundary");
      const data = (await res.json()) as { acked?: boolean; ackedAt?: string | null };
      setAcked(Boolean(data.acked));
      setAckedAt(data.ackedAt ?? null);
      if (data.acked) setChecked(true);
    } catch {
      const local = localStorage.getItem("axial_trust_boundary_acked");
      if (local) {
        setAcked(true);
        setAckedAt(local);
        setChecked(true);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAck = async () => {
    if (!checked) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/org/trust-boundary", { method: "POST" });
      const data = (await res.json()) as { ackedAt?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Ack failed");
      const at = data.ackedAt ?? new Date().toISOString();
      localStorage.setItem("axial_trust_boundary_acked", at);
      setAcked(true);
      setAckedAt(at);
      onAcked?.();
    } catch (err) {
      const at = new Date().toISOString();
      localStorage.setItem("axial_trust_boundary_acked", at);
      setAcked(true);
      setAckedAt(at);
      onAcked?.();
      setError(err instanceof Error ? err.message : null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Icon name="gavel" size={22} className="text-primary" />
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {TRUST_BOUNDARY_DRAFT.title}
            </h3>
          </div>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant/70">
            {TRUST_BOUNDARY_DRAFT.watermark}
          </p>
        </div>
        {acked ? (
          <span className="shrink-0 rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-2.5 py-1 font-label-sm text-label-sm text-[#2DD4BF]">
            Acknowledged
          </span>
        ) : null}
      </div>

      <ul className="mb-4 space-y-2">
        {TRUST_BOUNDARY_DRAFT.clauses.map((clause) => (
          <li
            key={clause}
            className="font-body-md text-body-md text-on-surface-variant leading-relaxed"
          >
            {clause}
          </li>
        ))}
      </ul>

      {acked && ackedAt ? (
        <p className="font-label-sm text-label-sm text-on-surface-variant/60">
          Recorded {new Date(ackedAt).toLocaleString()}
        </p>
      ) : (
        <div className="space-y-3 border-t border-outline-variant/10 pt-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-outline-variant/40"
            />
            <span className="font-body-md text-body-md text-on-surface">
              I acknowledge these boundaries before tokenizing receivables on Axial.
            </span>
          </label>
          {error ? (
            <p className="font-body-md text-body-md text-on-surface-variant/60">{error}</p>
          ) : null}
          <Button
            variant="primary"
            disabled={!checked || busy}
            onClick={() => void handleAck()}
          >
            {busy ? "Saving…" : "Acknowledge"}
          </Button>
        </div>
      )}
    </Card>
  );
}
