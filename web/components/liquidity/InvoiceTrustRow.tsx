"use client";

import type { InvoiceTrustState } from "@/lib/msme/invoice-trust";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type Props = {
  trust: InvoiceTrustState;
  onMarkCollected: () => void;
};

/** Collapsed detail strip — lockbox only, shown on demand. */
export function InvoiceTrustRow({ trust, onMarkCollected }: Props) {
  if (!trust.lockboxAddress) return null;

  return (
    <tr className="border-b border-outline-variant/10 bg-surface-container-low/20">
      <td colSpan={7} className="px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 font-label-sm text-label-sm text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5 text-on-surface">
              <Icon name="lock" size={14} className="text-[#2DD4BF]" />
              Lockbox {trust.lockboxAddress.slice(0, 16)}…
            </span>
            <span>Memo {trust.lockboxMemo}</span>
          </div>
          {trust.collectionStatus === "open" ? (
            <Button variant="ghost" size="sm" className="shrink-0 text-primary" onClick={onMarkCollected}>
              Mark collected
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
