"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { phpToUsdcWhole } from "@/lib/fx/units";
import { DEFAULT_ADVANCE_BPS, quoteAdvance } from "@/lib/soroban/quote";

function formatPhp(n: number) {
  return n.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  });
}

export type AdvanceConfirmDraft = {
  id: string;
  party: string;
  face: number;
};

type Props = {
  draft: AdvanceConfirmDraft;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const HOLD_MS = 3000;

/**
 * Clear-signing panel — plain-language preview before mint + swap.
 * Advance/reserve derived from FX→USDC face (same path as execute), shown in PHP.
 * Primary CTA requires a 3-second hold to reduce fat-finger executes.
 */
export function AdvanceConfirmPanel({ draft, busy, onCancel, onConfirm }: Props) {
  const [phpPerUsdc, setPhpPerUsdc] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/fx/rate")
      .then((r) => r.json())
      .then((data: { phpPerUsdc?: number }) => {
        if (!cancelled && Number.isFinite(data.phpPerUsdc) && (data.phpPerUsdc ?? 0) > 0) {
          setPhpPerUsdc(data.phpPerUsdc!);
        }
      })
      .catch(() => {
        if (!cancelled) setPhpPerUsdc(56.5);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rate = phpPerUsdc ?? 56.5;
  const faceUsdc = phpToUsdcWhole(draft.face, rate);
  const { advance: advanceUsdc, reserve: reserveUsdc, advanceBps } = quoteAdvance(faceUsdc);
  const advancePhp = Math.round(advanceUsdc * rate);
  const reservePhp = Math.round(reserveUsdc * rate);
  const pct = (advanceBps / 100).toFixed(0);

  useEffect(() => {
    if (!holding || busy) return;
    const started = Date.now();
    const id = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - started) / HOLD_MS);
      setHoldProgress(p);
      if (p >= 1) {
        window.clearInterval(id);
        setHolding(false);
        setHoldProgress(0);
        onConfirm();
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [holding, busy, onConfirm]);

  function releaseHold() {
    setHolding(false);
    setHoldProgress(0);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="advance-confirm-title"
    >
      <div className="w-full max-w-md rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2DD4BF]/40 bg-[#2DD4BF]/15 text-[#2DD4BF]">
            <Icon name="verified_user" size={20} />
          </div>
          <div>
            <h2
              id="advance-confirm-title"
              className="font-headline-md text-[18px] sm:text-headline-md text-on-surface"
            >
              Confirm this advance
            </h2>
            <p className="mt-1 font-body-md text-[13px] text-on-surface-variant">
              Review exactly what will run on Stellar before anything is signed.
            </p>
          </div>
        </div>

        <dl className="space-y-3 rounded-lg border border-outline-variant/15 bg-surface-container/40 p-4">
          <div className="flex justify-between gap-4">
            <dt className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              Invoice
            </dt>
            <dd className="text-right font-body-md text-[13px] text-on-surface">
              {draft.id}
              <span className="mt-0.5 block text-on-surface-variant">{draft.party}</span>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              Face value
            </dt>
            <dd className="font-body-md text-[13px] text-on-surface">{formatPhp(draft.face)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-outline-variant/10 pt-3">
            <dt className="font-label-sm text-[11px] uppercase tracking-wider text-[#2DD4BF]">
              Advance to your wallet ({pct}%)
            </dt>
            <dd className="font-headline-sm text-[15px] font-semibold text-[#2DD4BF]">
              {formatPhp(advancePhp)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              Holdback reserve
            </dt>
            <dd className="font-body-md text-[13px] text-on-surface">{formatPhp(reservePhp)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              On-chain face (USDC)
            </dt>
            <dd className="font-body-md text-[13px] text-on-surface-variant">
              {faceUsdc.toLocaleString()} USDC @ {rate.toFixed(2)}
            </dd>
          </div>
        </dl>

        <ul className="mt-4 space-y-2 font-body-md text-[13px] text-on-surface-variant">
          <li className="flex gap-2">
            <Icon name="token" size={16} className="mt-0.5 shrink-0 text-[#2DD4BF]" />
            <span>
              Mint a receivable token for this invoice ({DEFAULT_ADVANCE_BPS} bps advance logic).
            </span>
          </li>
          <li className="flex gap-2">
            <Icon name="swap_horiz" size={16} className="mt-0.5 shrink-0 text-[#2DD4BF]" />
            <span>Atomic USDC swap from the funder treasury to your Stellar wallet.</span>
          </li>
          <li className="flex gap-2">
            <Icon name="balance" size={16} className="mt-0.5 shrink-0 text-[#2DD4BF]" />
            <span>
              Prepare a BIR EIS filing for your review within T+3 — nothing submits without your
              approval.
            </span>
          </li>
        </ul>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
          <button
            type="button"
            disabled={busy}
            className="relative overflow-hidden rounded-lg bg-[#2DD4BF] px-4 py-2 font-label-md text-[13px] font-medium text-on-primary disabled:opacity-50"
            onPointerDown={() => !busy && setHolding(true)}
            onPointerUp={releaseHold}
            onPointerLeave={releaseHold}
            onPointerCancel={releaseHold}
          >
            <span
              className="absolute inset-y-0 left-0 bg-white/25 transition-[width]"
              style={{ width: `${holdProgress * 100}%` }}
              aria-hidden
            />
            <span className="relative">
              {busy
                ? "Executing…"
                : holding
                  ? "Keep holding…"
                  : "Hold 3s to execute"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
