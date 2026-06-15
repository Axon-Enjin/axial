"use client";

import type { FunderDealRow } from "@/lib/funder/types";
import { FunderDiligenceBadges } from "./FunderDiligenceBadges";

type Props = {
  deal: FunderDealRow;
};

export function FunderDealDrawer({ deal }: Props) {
  return (
    <tr className="border-b border-outline-variant/10 bg-surface-container-low/20">
      <td colSpan={7} className="px-3 py-3 sm:px-4 sm:py-4 md:px-6">
        <div className="space-y-3">
          <FunderDiligenceBadges diligence={deal.diligence} />
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant">
            {deal.dueDate ? <span>Due {deal.dueDate}</span> : null}
            {deal.collectedAmount != null ? (
              <span>Collected ₱{deal.collectedAmount.toLocaleString()}</span>
            ) : null}
            {deal.shortfall != null && deal.shortfall > 0 ? (
              <span className="text-amber-300">Shortfall ₱{deal.shortfall.toLocaleString()}</span>
            ) : null}
            {deal.lockboxAddress ? (
              <span className="font-mono">
                Lockbox {deal.lockboxAddress.slice(0, 18)}…
                {deal.lockboxMemo ? ` · memo ${deal.lockboxMemo}` : ""}
              </span>
            ) : null}
            {deal.funderAddress ? (
              <span className="font-mono">Funder {deal.funderAddress.slice(0, 12)}…</span>
            ) : null}
          </div>
          {deal.diligence.blockers.length > 0 && !deal.diligence.fundable ? (
            <p className="font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant">
              Blockers: {deal.diligence.blockers.join(", ").replace(/_/g, " ")}
            </p>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
