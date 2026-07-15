"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function formatPhp(n: number) {
  return n.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  });
}

export type PayrollConfirmDraft = {
  gross: number;
  sss: number;
  philhealth: number;
  pagibig: number;
  net: number;
};

type Props = {
  draft: PayrollConfirmDraft;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Clear-signing panel before payroll route on Stellar. */
export function PayrollConfirmPanel({ draft, busy, onCancel, onConfirm }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payroll-confirm-title"
    >
      <div className="w-full max-w-md rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2DD4BF]/40 bg-[#2DD4BF]/15 text-[#2DD4BF]">
            <Icon name="call_split" size={20} />
          </div>
          <div>
            <h2
              id="payroll-confirm-title"
              className="font-headline-md text-[18px] sm:text-headline-md text-on-surface"
            >
              Confirm payroll route
            </h2>
            <p className="mt-1 font-body-md text-[13px] text-on-surface-variant">
              Review statutory splits and net pay before signing on Stellar.
            </p>
          </div>
        </div>

        <dl className="space-y-2.5 rounded-lg border border-outline-variant/15 bg-surface-container/40 p-4">
          <div className="flex justify-between gap-4">
            <dt className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              Gross payroll
            </dt>
            <dd className="font-body-md text-[13px] text-on-surface">{formatPhp(draft.gross)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              SSS
            </dt>
            <dd className="font-body-md text-[13px] text-on-surface">{formatPhp(draft.sss)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              PhilHealth
            </dt>
            <dd className="font-body-md text-[13px] text-on-surface">{formatPhp(draft.philhealth)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              Pag-IBIG
            </dt>
            <dd className="font-body-md text-[13px] text-on-surface">{formatPhp(draft.pagibig)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-outline-variant/10 pt-3">
            <dt className="font-label-sm text-[11px] uppercase tracking-wider text-[#2DD4BF]">
              Net to employees
            </dt>
            <dd className="font-headline-sm text-[15px] font-semibold text-[#2DD4BF]">
              {formatPhp(draft.net)}
            </dd>
          </div>
        </dl>

        <ul className="mt-4 space-y-2 font-body-md text-[13px] text-on-surface-variant">
          <li className="flex gap-2">
            <Icon name="swap_horiz" size={16} className="mt-0.5 shrink-0 text-[#2DD4BF]" />
            <span>One Soroban transaction routes USDC to agency wallets and employee net.</span>
          </li>
          <li className="flex gap-2">
            <Icon name="balance" size={16} className="mt-0.5 shrink-0 text-[#2DD4BF]" />
            <span>Prepares a BIR EIS payroll filing for your review within T+3.</span>
          </li>
        </ul>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="teal"
            size="sm"
            disabled={busy}
            icon={busy ? "progress_activity" : "call_split"}
            onClick={onConfirm}
          >
            {busy ? "Routing…" : "Confirm & route"}
          </Button>
        </div>
      </div>
    </div>
  );
}
