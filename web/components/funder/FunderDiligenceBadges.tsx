import { Icon } from "@/components/ui/Icon";
import type { FunderDiligence } from "@/lib/funder/types";

type BadgeProps = {
  ok: boolean;
  label: string;
  icon: string;
};

function DiligenceBadge({ ok, label, icon }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-label-sm text-[10px] sm:text-label-sm",
        ok
          ? "border-[#2DD4BF]/30 bg-[#2DD4BF]/10 text-[#2DD4BF]"
          : "border-outline-variant/30 bg-surface-container-high/60 text-on-surface-variant",
      ].join(" ")}
      title={ok ? `${label} complete` : `${label} pending`}
    >
      <Icon name={ok ? "check_circle" : icon} size={14} />
      {label}
    </span>
  );
}

export function FunderDiligenceBadges({ diligence }: { diligence: FunderDiligence }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      <DiligenceBadge ok={diligence.payerKybOk} label="Payer KYB" icon="verified_user" />
      <DiligenceBadge ok={diligence.payerConfirmedOk} label="Confirmed" icon="task_alt" />
      <DiligenceBadge ok={diligence.noaAckOk} label="NoA ack" icon="draw" />
      {diligence.reserveHeld != null ? (
        <span className="font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant">
          Reserve ₱{diligence.reserveHeld.toLocaleString()} · {diligence.advanceBps / 100}% advance
        </span>
      ) : null}
    </div>
  );
}
